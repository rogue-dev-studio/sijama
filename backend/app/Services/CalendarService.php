<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 17:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 19:05:00
 */

namespace App\Services;

use App\Models\HariLibur;
use App\Models\KategoriKegiatan;
use App\Models\Kegiatan;
use Carbon\Carbon;

class CalendarService
{
    private const DEFAULT_COLOR = '#2563eb';

    public function month(int $year, int $month): array
    {
        $start = Carbon::create($year, $month, 1)->startOfDay();
        $end = $start->copy()->endOfMonth();

        $holidays = HariLibur::query()
            ->where('is_active', true)
            ->whereBetween('tanggal', [$start->toDateString(), $end->toDateString()])
            ->orderBy('tanggal')
            ->get()
            ->keyBy(fn (HariLibur $item) => $item->tanggal->toDateString());

        $kegiatan = Kegiatan::query()
            ->with('kategoriKegiatan:id,nama,calendar_color')
            ->whereBetween('tanggal', [$start->toDateString(), $end->toDateString()])
            ->where('status', '!=', 'cancelled')
            ->orderBy('tanggal')
            ->orderBy('jam_mulai')
            ->get();

        $eventsByDate = [];

        foreach ($kegiatan as $item) {
            $date = $item->tanggal->toDateString();
            $eventsByDate[$date][] = $this->mapKegiatan($item);
        }

        $days = [];
        $cursor = $start->copy();
        while ($cursor->lte($end)) {
            $date = $cursor->toDateString();
            $holiday = $holidays->get($date);
            $days[] = [
                'date' => $date,
                'is_friday' => $cursor->isFriday(),
                'holiday' => $holiday ? [
                    'id' => $holiday->id,
                    'nama' => $holiday->nama,
                    'jenis' => $holiday->jenis,
                ] : null,
                'events' => $eventsByDate[$date] ?? [],
            ];
            $cursor->addDay();
        }

        return [
            'year' => $year,
            'month' => $month,
            'days' => $days,
            'holidays' => $holidays->values()->map(fn (HariLibur $item) => [
                'id' => $item->id,
                'tanggal' => $item->tanggal->toDateString(),
                'nama' => $item->nama,
                'jenis' => $item->jenis,
            ])->all(),
            'legend' => $this->buildLegend(),
        ];
    }

    /**
     * @return list<array{id: int, nama: string, color: string}>
     */
    private function buildLegend(): array
    {
        return KategoriKegiatan::query()
            ->where('is_active', true)
            ->orderBy('nama')
            ->get(['id', 'nama', 'calendar_color'])
            ->map(fn (KategoriKegiatan $item) => [
                'id' => $item->id,
                'nama' => $item->nama,
                'color' => $item->calendar_color ?: self::DEFAULT_COLOR,
            ])
            ->values()
            ->all();
    }

    private function mapKegiatan(Kegiatan $item): array
    {
        $kategori = $item->kategoriKegiatan;
        $timeLabel = null;

        if ($item->jam_mulai) {
            $timeLabel = substr((string) $item->jam_mulai, 0, 5);
            if ($item->jam_selesai) {
                $timeLabel .= '–'.substr((string) $item->jam_selesai, 0, 5);
            }
        }

        return [
            'id' => $item->id,
            'type' => 'kegiatan',
            'title' => $item->judul,
            'time_label' => $timeLabel,
            'status' => $item->status,
            'color' => $kategori?->calendar_color ?: self::DEFAULT_COLOR,
            'kategori_id' => $kategori?->id,
            'kategori_nama' => $kategori?->nama,
        ];
    }
}
