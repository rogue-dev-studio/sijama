<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Jamaah;
use App\Models\Kegiatan;
use App\Models\Kelompok;
use App\Models\Pengajian;
use App\Models\User;
use App\Support\JamaahKategoriUmur;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class DashboardService
{
    private const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    public function __construct(private readonly ScopeService $scopeService) {}

    public function getDashboard(User $user): array
    {
        $now = Carbon::now();
        $weekStart = $now->copy()->startOfWeek();
        $weekEnd = $now->copy()->endOfWeek();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();

        $jamaahQuery = Jamaah::query()->where('status', 'aktif');
        $this->scopeService->applyJamaahScope($jamaahQuery, $user);
        $jamaahAktif = (clone $jamaahQuery)->count();

        return [
            'jamaah_aktif' => $jamaahAktif,
            'pengajian_minggu_ini' => Pengajian::whereBetween('starts_at', [$weekStart, $weekEnd])->count(),
            'absensi_hari_ini' => Attendance::query()
                ->whereDate('recorded_at', $now->toDateString())
                ->whereHas('jamaah', function (Builder $q) use ($user) {
                    $this->scopeService->applyJamaahScope($q, $user);
                })
                ->count(),
            'kegiatan_bulan_ini' => Kegiatan::whereBetween('tanggal', [$monthStart->toDateString(), $monthEnd->toDateString()])->count(),
            'chart_absensi_7_hari' => $this->buildChartAbsensi7Hari($user, $now),
            'absensi_overview' => $this->buildAbsensiOverview($user, $now, $jamaahAktif),
            'chart_jamaah_per_kelompok' => $this->buildChartJamaahPerKelompok($user),
            'chart_kategori_umur' => $this->buildChartKategoriUmur($user),
        ];
    }

    private function buildAbsensiOverview(User $user, Carbon $now, int $jamaahAktif): array
    {
        return [
            'week' => $this->buildPresetPeriod($user, $now, $jamaahAktif, 7, '7 hari terakhir'),
            'month' => $this->buildPresetPeriod($user, $now, $jamaahAktif, 30, '30 hari terakhir'),
            'year' => $this->buildPresetPeriod($user, $now, $jamaahAktif, 365, '365 hari terakhir'),
        ];
    }

    public function getAbsensiOverviewForRange(User $user, Carbon $from, Carbon $to): array
    {
        $jamaahQuery = Jamaah::query()->where('status', 'aktif');
        $this->scopeService->applyJamaahScope($jamaahQuery, $user);
        $jamaahAktif = $jamaahQuery->count();

        $from = $from->copy()->startOfDay();
        $to = $to->copy()->endOfDay();
        if ($from->greaterThan($to)) {
            [$from, $to] = [$to->copy()->startOfDay(), $from->copy()->endOfDay()];
        }

        $days = max(1, $from->diffInDays($to) + 1);
        $prevTo = $from->copy()->subDay()->endOfDay();
        $prevFrom = $prevTo->copy()->subDays($days - 1)->startOfDay();

        $period = $this->buildAbsensiUmurPeriod($user, $from, $to, $prevFrom, $prevTo, $jamaahAktif);
        $period['period_label'] = sprintf(
            '%s – %s',
            $from->format('d M Y'),
            $to->format('d M Y'),
        );
        $period['from'] = $from->toDateString();
        $period['to'] = $to->toDateString();

        return $period;
    }

    private function buildPresetPeriod(
        User $user,
        Carbon $now,
        int $jamaahAktif,
        int $days,
        string $label,
    ): array {
        $to = $now->copy()->endOfDay();
        $from = $now->copy()->subDays($days - 1)->startOfDay();
        $prevTo = $from->copy()->subDay()->endOfDay();
        $prevFrom = $prevTo->copy()->subDays($days - 1)->startOfDay();

        $period = $this->buildAbsensiUmurPeriod($user, $from, $to, $prevFrom, $prevTo, $jamaahAktif);
        $period['period_label'] = $label;
        $period['from'] = $from->toDateString();
        $period['to'] = $to->toDateString();

        return $period;
    }

    private function buildAbsensiUmurPeriod(
        User $user,
        Carbon $from,
        Carbon $to,
        Carbon $prevFrom,
        Carbon $prevTo,
        int $jamaahAktif,
    ): array {
        $current = $this->absensiCountsByUmur($user, $from, $to);
        $previous = $this->absensiCountsByUmur($user, $prevFrom, $prevTo);

        $series = [];
        $ranked = [];

        foreach (JamaahKategoriUmur::VALUES as $kode) {
            $value = (int) ($current[$kode] ?? 0);
            $prev = (int) ($previous[$kode] ?? 0);
            $label = JamaahKategoriUmur::LABELS[$kode] ?? $kode;
            $series[] = [
                'kode' => $kode,
                'label' => $label,
                'value' => $value,
            ];
            $ranked[] = [
                'kode' => $kode,
                'label' => $label,
                'value' => $value,
                'delta' => $value - $prev,
            ];
        }

        usort($ranked, fn (array $a, array $b) => $b['value'] <=> $a['value']);
        $top = array_slice($ranked, 0, 3);
        $total = array_sum(array_column($series, 'value'));
        $target = max($jamaahAktif, 1);

        return [
            'series' => $series,
            'top' => $top,
            'total' => $total,
            'progress_pct' => (int) min(100, round(($total / $target) * 100)),
        ];
    }

    /**
     * @return array<string, int>
     */
    private function absensiCountsByUmur(User $user, Carbon $from, Carbon $to): array
    {
        $jamaahScope = Jamaah::query()->select('id');
        $this->scopeService->applyJamaahScope($jamaahScope, $user);

        return Attendance::query()
            ->join('jamaah', 'jamaah.id', '=', 'attendances.jamaah_id')
            ->whereBetween('attendances.recorded_at', [
                $from->copy()->startOfDay(),
                $to->copy()->endOfDay(),
            ])
            ->whereIn('attendances.jamaah_id', $jamaahScope)
            ->whereNotNull('jamaah.kategori_umur')
            ->groupBy('jamaah.kategori_umur')
            ->selectRaw('jamaah.kategori_umur as kategori_umur, COUNT(*) as total')
            ->pluck('total', 'kategori_umur')
            ->map(fn ($v) => (int) $v)
            ->all();
    }

    private function buildChartAbsensi7Hari(User $user, Carbon $now): array
    {
        $series = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $value = Attendance::query()
                ->whereDate('recorded_at', $date->toDateString())
                ->whereHas('jamaah', function (Builder $q) use ($user) {
                    $this->scopeService->applyJamaahScope($q, $user);
                })
                ->count();

            $series[] = [
                'label' => self::DAY_LABELS[$date->dayOfWeek],
                'value' => $value,
            ];
        }

        return $series;
    }

    private function buildChartJamaahPerKelompok(User $user): array
    {
        $query = Kelompok::query()
            ->withCount([
                'jamaah as jamaah_aktif_count' => function (Builder $q) use ($user) {
                    $q->where('status', 'aktif');
                    $this->scopeService->applyJamaahScope($q, $user);
                },
            ])
            ->orderByDesc('jamaah_aktif_count')
            ->limit(8);

        $this->scopeService->applyKelompokScope($query, $user);

        return $query->get()
            ->filter(fn (Kelompok $row) => $row->jamaah_aktif_count > 0)
            ->map(fn (Kelompok $row) => [
                'label' => $row->nama,
                'value' => (int) $row->jamaah_aktif_count,
            ])
            ->values()
            ->all();
    }

    private function buildChartKategoriUmur(User $user): array
    {
        $query = Jamaah::query()->where('status', 'aktif');
        $this->scopeService->applyJamaahScope($query, $user);

        $counts = (clone $query)
            ->whereNotNull('kategori_umur')
            ->selectRaw('kategori_umur, COUNT(*) as total')
            ->groupBy('kategori_umur')
            ->pluck('total', 'kategori_umur');

        $series = [];

        foreach (JamaahKategoriUmur::VALUES as $kode) {
            $series[] = [
                'label' => JamaahKategoriUmur::LABELS[$kode] ?? $kode,
                'value' => (int) ($counts[$kode] ?? 0),
            ];
        }

        return $series;
    }
}
