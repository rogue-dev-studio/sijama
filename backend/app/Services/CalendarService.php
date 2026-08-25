<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 17:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 18:25:00
 */

namespace App\Services;

use App\Models\HariLibur;
use App\Models\KategoriKegiatan;
use App\Models\Kegiatan;
use App\Models\Pengajian;
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
            ->get();

        $pengajian = Pengajian::query()
            ->with('kategoriKegiatan:id,nama,calendar_color')
            ->whereDate('starts_at', '>=', $start->toDateString())
            ->whereDate('starts_at', '<=', $end->toDateString())
            ->where('status', '!=', 'cancelled')
            ->orderBy('starts_at')
            ->get();

        $eventsByDate = [];

        foreach ($kegiatan as $item) {
            $date = $item->tanggal->toDateString();
            $eventsByDate[$date][] = $this->mapKegiatan($item);
        }

        foreach ($pengajian as $item) {
            $date = $item->starts_at->toDateString();
            $eventsByDate[$date][] = $this->mapPengajian($item);
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

        return [
            'id' => $item->id,
            'type' => 'kegiatan',
            'title' => $item->judul,
            'time_label' => null,
            'status' => $item->status,
            'color' => $kategori?->calendar_color ?: self::DEFAULT_COLOR,
            'kategori_id' => $kategori?->id,
            'kategori_nama' => $kategori?->nama,
        ];
    }

    private function mapPengajian(Pengajian $item): array
    {
        $kategori = $item->kategoriKegiatan;
        $time = $item->starts_at->format('H:i');
        if ($item->ends_at) {
            $time .= '–'.$item->ends_at->format('H:i');
        }

        return [
            'id' => $item->id,
            'type' => 'pengajian',
            'title' => $item->judul,
            'time_label' => $time,
            'status' => $item->status,
            'color' => $kategori?->calendar_color ?: '#0f766e',
            'kategori_id' => $kategori?->id,
            'kategori_nama' => $kategori?->nama ?: 'Pengajian',
        ];
    }
}
