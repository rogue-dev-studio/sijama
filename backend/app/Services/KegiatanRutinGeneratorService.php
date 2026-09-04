<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 18:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 18:05:00
 */

namespace App\Services;

use App\Models\Kegiatan;
use App\Models\KegiatanJadwalRutin;
use App\Models\KategoriKegiatan;
use App\Models\Lokasi;
use App\Models\Pemateri;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class KegiatanRutinGeneratorService
{
    public function syncAllActive(?CarbonInterface $reference = null): int
    {
        $reference = $reference ? Carbon::instance($reference)->startOfDay() : now()->startOfDay();
        $total = 0;

        KegiatanJadwalRutin::query()
            ->where('is_active', true)
            ->whereDate('effective_from', '<=', $reference)
            ->where(function ($query) use ($reference) {
                $query->whereNull('effective_until')
                    ->orWhereDate('effective_until', '>=', $reference);
            })
            ->orderBy('id')
            ->chunkById(50, function ($schedules) use ($reference, &$total) {
                foreach ($schedules as $schedule) {
                    $total += $this->syncSchedule($schedule, $reference);
                }
            });

        return $total;
    }

    public function syncSchedule(KegiatanJadwalRutin $schedule, ?CarbonInterface $reference = null): int
    {
        if (! $schedule->is_active) {
            return 0;
        }

        $reference = $reference ? Carbon::instance($reference)->startOfDay() : now()->startOfDay();
        $effectiveFrom = Carbon::parse($schedule->effective_from)->startOfDay();
        $effectiveUntil = $schedule->effective_until
            ? Carbon::parse($schedule->effective_until)->startOfDay()
            : null;

        if ($effectiveUntil !== null && $effectiveUntil->lt($effectiveFrom)) {
            return 0;
        }

        $horizonDays = max(7, min(365, (int) $schedule->generate_horizon_days));
        $horizonBase = $reference->lt($effectiveFrom) ? $effectiveFrom->copy() : $reference->copy();

        if ($effectiveUntil !== null && $horizonBase->gt($effectiveUntil)) {
            return 0;
        }

        $rangeStart = $effectiveFrom->copy();
        if ($schedule->last_generated_until !== null) {
            $rangeStart = Carbon::parse($schedule->last_generated_until)->addDay()->startOfDay();
        }
        if ($rangeStart->lt($effectiveFrom)) {
            $rangeStart = $effectiveFrom->copy();
        }

        $rangeEnd = $horizonBase->copy()->addDays($horizonDays);
        if ($effectiveUntil !== null && $rangeEnd->gt($effectiveUntil)) {
            $rangeEnd = $effectiveUntil->copy();
        }

        if ($rangeStart->gt($rangeEnd)) {
            return 0;
        }

        $created = 0;
        $cursor = $rangeStart->copy();

        while ($cursor->lte($rangeEnd)) {
            if ($this->matchesSchedule($schedule, $cursor)) {
                $created += $this->createInstanceIfMissing($schedule, $cursor);
            }
            $cursor->addDay();
        }

        if ($created > 0 || $schedule->last_generated_until === null) {
            $schedule->forceFill(['last_generated_until' => $rangeEnd->toDateString()])->save();
        }

        return $created;
    }

    public function matchesSchedule(KegiatanJadwalRutin $schedule, CarbonInterface $date): bool
    {
        $date = Carbon::instance($date)->startOfDay();

        return match ($schedule->frekuensi) {
            KegiatanJadwalRutin::FREKUENSI_MINGGUAN => (int) $schedule->day_of_week === $date->isoWeekday(),
            KegiatanJadwalRutin::FREKUENSI_BULANAN => (int) $date->day === $this->resolveDayOfMonth($schedule, $date),
            KegiatanJadwalRutin::FREKUENSI_TAHUNAN => (int) $schedule->month_of_year === $date->month
                && (int) $date->day === $this->resolveDayOfMonth($schedule, $date),
            default => false,
        };
    }

    private function resolveDayOfMonth(KegiatanJadwalRutin $schedule, CarbonInterface $date): int
    {
        $target = (int) $schedule->day_of_month;
        $daysInMonth = $date->daysInMonth;

        return min($target, $daysInMonth);
    }

    private function createInstanceIfMissing(KegiatanJadwalRutin $schedule, CarbonInterface $date): int
    {
        $tanggal = Carbon::instance($date)->toDateString();

        $exists = Kegiatan::query()
            ->where('jadwal_rutin_id', $schedule->id)
            ->whereDate('tanggal', $tanggal)
            ->exists();

        if ($exists) {
            return 0;
        }

        DB::transaction(function () use ($schedule, $tanggal) {
            $kegiatan = Kegiatan::query()->create($this->buildKegiatanAttributes($schedule, $tanggal));
            $schedule->loadMissing('materi');
            $kegiatan->materi()->sync($schedule->materi->pluck('id')->all());
        });

        return 1;
    }

    /**
     * @return array<string, mixed>
     */
    public function buildKegiatanAttributes(KegiatanJadwalRutin $schedule, string $tanggal): array
    {
        $lokasiId = $schedule->lokasi_id;
        $kategoriId = $schedule->kategori_kegiatan_id;
        $pemateriId = $schedule->pemateri_id;
        $lokasi = $schedule->lokasi;
        $pemateri = $schedule->pemateri;
        $jenis = null;

        if ($lokasiId) {
            $lokasi = Lokasi::query()->whereKey($lokasiId)->value('nama') ?? $lokasi;
        }

        if ($pemateriId) {
            $pemateri = Pemateri::query()->whereKey($pemateriId)->value('nama') ?? $pemateri;
        }

        if ($kategoriId) {
            $jenis = KategoriKegiatan::query()->whereKey($kategoriId)->value('nama');
        }

        return [
            'judul' => $schedule->judul,
            'pemateri' => $pemateri,
            'pemateri_id' => $pemateriId,
            'jenis' => $jenis,
            'kategori_kegiatan_id' => $kategoriId,
            'tanggal' => $tanggal,
            'jam_mulai' => $schedule->jam_mulai,
            'jam_selesai' => $schedule->jam_selesai,
            'lokasi' => $lokasi,
            'lokasi_id' => $lokasiId,
            'deskripsi' => $schedule->deskripsi,
            'status' => 'planned',
            'jadwal_rutin_id' => $schedule->id,
            'wilayah_fung_daerah_id' => $schedule->wilayah_fung_daerah_id,
            'wilayah_fung_desa_id' => $schedule->wilayah_fung_desa_id,
            'wilayah_fung_kelompok_id' => $schedule->wilayah_fung_kelompok_id,
        ];
    }
}
