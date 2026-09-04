<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 17:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 18:00:00
 */

namespace App\Services;

use App\Models\HariLibur;
use App\Models\KonfigSystemK;
use App\Support\SystemKonfig;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

class ApiCoIdHolidayService
{
    public function isEnabled(): bool
    {
        return (bool) config('integrations.api_co_id.enabled', true);
    }

    /**
     * @return list<array{tanggal: string, nama: string, jenis: string}>
     */
    public function fetchForYear(int $year): array
    {
        if (! $this->isEnabled()) {
            throw new RuntimeException('Sinkron hari libur api.co.id nonaktif di konfigurasi.');
        }

        $apiKey = (string) config('integrations.api_co_id.api_key');
        if ($apiKey === '') {
            throw new RuntimeException('API key api.co.id belum dikonfigurasi.');
        }

        $baseUrl = (string) config('integrations.api_co_id.holiday_base_url');
        $timeout = (int) config('integrations.api_co_id.timeout_seconds', 30);

        try {
            $response = Http::timeout($timeout)
                ->acceptJson()
                ->withHeaders(['x-api-co-id' => $apiKey])
                ->get($baseUrl, ['year' => $year])
                ->throw();
        } catch (RequestException $exception) {
            $message = $exception->response?->json('message');

            throw new RuntimeException(
                is_string($message) && $message !== ''
                    ? $message
                    : 'Gagal mengambil data hari libur dari api.co.id.',
                0,
                $exception,
            );
        }

        $payload = $response->json();
        if (! is_array($payload) || ($payload['is_success'] ?? false) !== true) {
            $message = is_array($payload) ? ($payload['message'] ?? null) : null;

            throw new RuntimeException(
                is_string($message) && $message !== ''
                    ? $message
                    : 'Respons api.co.id tidak valid.',
            );
        }

        $rows = $payload['data'] ?? [];
        if (! is_array($rows)) {
            throw new RuntimeException('Respons api.co.id tidak memuat daftar hari libur.');
        }

        $mapped = [];
        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }

            $item = $this->mapRow($row);
            if ($item !== null) {
                $mapped[] = $item;
            }
        }

        return $mapped;
    }

    /**
     * @return array{year: int, synced: int}
     */
    public function syncYear(int $year): array
    {
        $rows = $this->fetchForYear($year);
        $synced = 0;

        foreach ($rows as $row) {
            HariLibur::updateOrCreate(
                ['tanggal' => $row['tanggal']],
                [
                    'nama' => $row['nama'],
                    'jenis' => $row['jenis'],
                    'is_active' => true,
                ],
            );
            $synced++;
        }

        return [
            'year' => $year,
            'synced' => $synced,
        ];
    }

    /**
     * @param  list<int>  $years
     * @return list<array{year: int, synced: int}>
     */
    public function syncYears(array $years): array
    {
        $results = [];
        foreach ($years as $year) {
            $results[] = $this->syncYear($year);
        }

        $this->recordSyncMetadata($results);

        return $results;
    }

    /**
     * @param  array{year?: int|null, next?: bool|null}  $options
     * @return list<array{year: int, synced: int}>
     */
    public function syncFromOptions(array $options = []): array
    {
        $years = $this->resolveYears($options);
        if ($years === []) {
            throw new RuntimeException('Tahun sinkron tidak valid.');
        }

        return $this->syncYears($years);
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array{tanggal: string, nama: string, jenis: string}|null
     */
    public function mapRow(array $row): ?array
    {
        $date = $row['date'] ?? null;
        $name = $row['name'] ?? null;
        if (! is_string($date) || ! is_string($name) || trim($name) === '') {
            return null;
        }

        if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return null;
        }

        $isJoint = (bool) ($row['is_joint_holiday'] ?? false);
        $isObservance = (bool) ($row['is_observance'] ?? false);

        if ($isObservance && ! $isJoint) {
            return null;
        }

        return [
            'tanggal' => $date,
            'nama' => trim($name),
            'jenis' => $isJoint ? 'cuti_bersama' : 'nasional',
        ];
    }

    /**
     * @param  list<array{year: int, synced: int}>  $results
     */
    private function recordSyncMetadata(array $results): void
    {
        if (! Schema::hasColumn('konfigsystem_k', 'api_co_id_holiday_last_synced_at')) {
            return;
        }

        $konfig = KonfigSystemK::query()->notDeleted()->orderBy('konfigsystem_id')->first();
        if ($konfig === null) {
            return;
        }

        $total = array_sum(array_column($results, 'synced'));
        $konfig->update([
            'api_co_id_holiday_last_synced_at' => now(),
            'api_co_id_holiday_last_sync_count' => $total,
            'last_modified_date' => now(),
        ]);
        SystemKonfig::forgetCache();
    }

    /**
     * @param  array{year?: int|null, next?: bool|null}  $options
     * @return list<int>
     */
    private function resolveYears(array $options): array
    {
        $year = $options['year'] ?? null;
        if (is_int($year) && $year >= 2000 && $year <= 2100) {
            return [$year];
        }

        $years = [now()->year];
        if (($options['next'] ?? false) === true) {
            $years[] = now()->year + 1;
        }

        return array_values(array_unique($years));
    }
}
