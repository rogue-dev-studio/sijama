<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 17:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 19:12:00
 */

namespace App\Services;

use App\Models\Kegiatan;
use Carbon\Carbon;

class EventStatusService
{
    /**
     * @return array{kegiatan_ongoing: int, kegiatan_completed: int}
     */
    public function sync(?Carbon $now = null): array
    {
        $now = $now ?? now();
        $today = $now->toDateString();
        $nowTime = $now->format('H:i:s');

        $kegiatanOngoing = Kegiatan::query()
            ->where('status', 'planned')
            ->whereDate('tanggal', $today)
            ->update(['status' => 'ongoing']);

        $kegiatanCompleted = Kegiatan::query()
            ->whereIn('status', ['planned', 'ongoing'])
            ->where(function ($query) use ($today, $nowTime) {
                $query->whereDate('tanggal', '<', $today)
                    ->orWhere(function ($q) use ($today, $nowTime) {
                        $q->whereDate('tanggal', $today)
                            ->whereNotNull('jam_selesai')
                            ->where('jam_selesai', '<', $nowTime);
                    })
                    ->orWhere(function ($q) use ($today, $nowTime) {
                        $q->whereDate('tanggal', $today)
                            ->whereNull('jam_selesai')
                            ->whereNotNull('jam_mulai')
                            ->where('jam_mulai', '<', $nowTime);
                    });
            })
            ->update(['status' => 'completed']);

        return [
            'kegiatan_ongoing' => $kegiatanOngoing,
            'kegiatan_completed' => $kegiatanCompleted,
        ];
    }
}
