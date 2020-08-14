<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 17:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 17:50:00
 */

namespace App\Services;

use App\Models\Kegiatan;
use App\Models\Pengajian;
use Carbon\Carbon;

class EventStatusService
{
    /**
     * @return array{kegiatan_ongoing: int, kegiatan_completed: int, pengajian_completed: int}
     */
    public function sync(?Carbon $now = null): array
    {
        $now = $now ?? now();
        $today = $now->toDateString();

        $kegiatanOngoing = Kegiatan::query()
            ->where('status', 'planned')
            ->whereDate('tanggal', $today)
            ->update(['status' => 'ongoing']);

        $kegiatanCompleted = Kegiatan::query()
            ->whereIn('status', ['planned', 'ongoing'])
            ->whereDate('tanggal', '<', $today)
            ->update(['status' => 'completed']);

        $pengajianCompleted = Pengajian::query()
            ->where('status', 'scheduled')
            ->where(function ($query) use ($now) {
                $query->where(function ($q) use ($now) {
                    $q->whereNotNull('ends_at')->where('ends_at', '<', $now);
                })->orWhere(function ($q) use ($now) {
                    $q->whereNull('ends_at')->where('starts_at', '<', $now);
                });
            })
            ->update(['status' => 'completed']);

        return [
            'kegiatan_ongoing' => $kegiatanOngoing,
            'kegiatan_completed' => $kegiatanCompleted,
            'pengajian_completed' => $pengajianCompleted,
        ];
    }
}
