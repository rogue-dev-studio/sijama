<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 22:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 22:05:00
 */

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ReportingViewService
{
    public function __construct(private readonly ScopeService $scopeService) {}

    public function isEnabled(): bool
    {
        if (Schema::getConnection()->getDriverName() !== 'pgsql') {
            return false;
        }

        $exists = DB::selectOne(
            "SELECT 1 AS ok FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'absensi_harian_stats_mv' LIMIT 1"
        );

        return $exists !== null;
    }

    public function refresh(): void
    {
        if (! $this->isEnabled()) {
            return;
        }

        DB::statement('SELECT refresh_reporting_fn()');
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    public function chartAbsensi7Hari(User $user, Carbon $now): array
    {
        $from = $now->copy()->subDays(6)->toDateString();
        $to = $now->toDateString();

        $rows = $this->scopedQuery('absensi_harian_stats_mv', $user)
            ->select('hari', DB::raw('SUM(total) AS total'))
            ->whereBetween('hari', [$from, $to])
            ->groupBy('hari')
            ->pluck('total', 'hari');

        $labels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        $series = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $key = $date->toDateString();
            $series[] = [
                'label' => $labels[$date->dayOfWeek],
                'value' => (int) ($rows[$key] ?? 0),
            ];
        }

        return $series;
    }

    public function absensiHariIni(User $user, Carbon $now): int
    {
        return (int) $this->scopedQuery('absensi_harian_stats_mv', $user)
            ->where('hari', $now->toDateString())
            ->sum('total');
    }

    /**
     * @return array<string, int>
     */
    public function absensiCountsByUmur(User $user, Carbon $from, Carbon $to): array
    {
        return $this->scopedQuery('absensi_harian_stats_mv', $user)
            ->select('kategori_umur', DB::raw('SUM(total) AS total'))
            ->whereBetween('hari', [$from->toDateString(), $to->toDateString()])
            ->where('kategori_umur', '!=', '')
            ->groupBy('kategori_umur')
            ->pluck('total', 'kategori_umur')
            ->map(fn ($value) => (int) $value)
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    public function chartJamaahPerKelompok(User $user): array
    {
        return $this->scopedQuery('jamaah_kelompok_aktif_mv', $user)
            ->select('kelompok_nama', 'jamaah_aktif')
            ->where('jamaah_aktif', '>', 0)
            ->orderByDesc('jamaah_aktif')
            ->limit(8)
            ->get()
            ->map(fn ($row) => [
                'label' => (string) $row->kelompok_nama,
                'value' => (int) $row->jamaah_aktif,
            ])
            ->values()
            ->all();
    }

    public function jamaahAktifCount(User $user): int
    {
        return (int) $this->scopedQuery('jamaah_wilayah_v', $user)
            ->where('status', 'aktif')
            ->count();
    }

    /**
     * @return array<string, int>
     */
    public function kategoriUmurCounts(User $user): array
    {
        return $this->scopedQuery('jamaah_kategori_umur_mv', $user)
            ->select('kategori_umur', DB::raw('SUM(total) AS total'))
            ->groupBy('kategori_umur')
            ->pluck('total', 'kategori_umur')
            ->map(fn ($value) => (int) $value)
            ->all();
    }

    private function scopedQuery(string $source, User $user): Builder
    {
        $query = DB::table($source);

        if ($this->scopeService->isGlobal($user)) {
            return $query;
        }

        return match ($this->scopeService->tingkat($user)) {
            'pusat' => $query->where('wilayah_fung_pusat_id', $user->wilayah_fung_pusat_id),
            'daerah' => $query->where('wilayah_fung_daerah_id', $user->wilayah_fung_daerah_id),
            'desa' => $query->where('wilayah_fung_desa_id', $user->wilayah_fung_desa_id),
            'kelompok' => $query->where('wilayah_fung_kelompok_id', $user->wilayah_fung_kelompok_id),
            default => $query->whereRaw('1 = 0'),
        };
    }
}
