<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 15:05:00
 */

namespace App\Services;

use App\Models\Jamaah;
use App\Models\User;
use App\Support\JamaahKategoriUmur;
use App\Support\JamaahStatusPernikahan;
use App\Support\PaginationHelper;
use App\Support\SearchHelper;
use Carbon\Carbon;

class KategoriUmurService
{
    public function __construct(private readonly ScopeService $scopeService) {}

    /**
     * @return array{
     *   items: list<array<string, mixed>>,
     *   meta: array{current_page: int, last_page: int, per_page: int, total: int},
     *   ringkasan: list<array{kode: string|null, nama: string, grup: string, rentang_usia: string, jumlah: int}>
     * }
     */
    public function list(
        User $user,
        ?string $filterKategori = null,
        ?string $query = null,
        ?int $perPage = null,
        ?int $page = null,
    ): array {
        $builder = Jamaah::query()
            ->select([
                'id',
                'nama',
                'gender',
                'tanggal_lahir',
                'status_pernikahan',
                'kategori_umur',
                'wilayah_fung_kelompok_id',
                'status',
            ])
            ->with('wilayahFungKelompok:id,kode,nama')
            ->where('status', 'aktif')
            ->orderBy('nama');
        $this->scopeService->applyJamaahScope($builder, $user);

        if ($query) {
            SearchHelper::likeGroup($builder, ['nama', 'nik', 'email', 'no_hp'], $query);
        }

        if ($filterKategori !== null && $filterKategori !== '') {
            if ($filterKategori === 'belum') {
                $builder->whereNull('kategori_umur');
            } else {
                $builder->where('kategori_umur', $filterKategori);
            }
        }

        $paginator = PaginationHelper::paginate($builder, $perPage, $page);
        $envelope = PaginationHelper::envelope(
            $paginator,
            collect($paginator->items())->map(fn (Jamaah $jamaah) => $this->mapMember($jamaah))->all()
        );
        $envelope['ringkasan'] = $this->buildRingkasan($user);

        return $envelope;
    }

    /**
     * Semua kode kategori (termasuk jumlah 0) + belum diklasifikasi.
     *
     * @return list<array{kode: string|null, nama: string, grup: string, rentang_usia: string, jumlah: int}>
     */
    public function buildRingkasan(User $user): array
    {
        $query = Jamaah::query()->where('status', 'aktif');
        $this->scopeService->applyJamaahScope($query, $user);

        $counts = (clone $query)
            ->whereNotNull('kategori_umur')
            ->selectRaw('kategori_umur, COUNT(*) as total')
            ->groupBy('kategori_umur')
            ->pluck('total', 'kategori_umur');

        $belumCount = (int) (clone $query)->whereNull('kategori_umur')->count();

        $rows = [];
        foreach (JamaahKategoriUmur::VALUES as $kode) {
            $rows[] = [
                'kode' => $kode,
                'nama' => JamaahKategoriUmur::LABELS[$kode],
                'grup' => JamaahKategoriUmur::GROUPS[$kode],
                'rentang_usia' => JamaahKategoriUmur::ageRangeLabel($kode),
                'jumlah' => (int) ($counts[$kode] ?? 0),
            ];
        }

        $rows[] = [
            'kode' => 'belum',
            'nama' => 'Belum diklasifikasi',
            'grup' => 'Lainnya',
            'rentang_usia' => 'Tgl lahir kosong / usia 21–59 tanpa status nikah',
            'jumlah' => $belumCount,
        ];

        return $rows;
    }

    /**
     * @deprecated Prefer list() + ringkasan for UI.
     */
    public function summary(User $user, ?string $filterKategori = null): array
    {
        $builder = Jamaah::query()
            ->select([
                'id',
                'nama',
                'gender',
                'tanggal_lahir',
                'status_pernikahan',
                'wilayah_fung_kelompok_id',
                'status',
            ])
            ->with('wilayahFungKelompok:id,kode,nama')
            ->where('status', 'aktif')
            ->orderBy('nama');
        $this->scopeService->applyJamaahScope($builder, $user);

        $groups = [];
        foreach (JamaahKategoriUmur::VALUES as $kode) {
            $groups[$kode] = [
                'kode' => $kode,
                'nama' => JamaahKategoriUmur::LABELS[$kode],
                'grup' => JamaahKategoriUmur::GROUPS[$kode],
                'rentang_usia' => JamaahKategoriUmur::ageRangeLabel($kode),
                'jumlah' => 0,
                'items' => [],
            ];
        }

        $belum = [
            'kode' => null,
            'nama' => 'Belum diklasifikasi',
            'grup' => 'Lainnya',
            'rentang_usia' => 'Tgl lahir kosong, atau usia 21–59 tanpa status pernikahan',
            'jumlah' => 0,
            'items' => [],
        ];

        foreach ($builder->get() as $jamaah) {
            $kode = JamaahKategoriUmur::classify(
                $jamaah->tanggal_lahir ? Carbon::parse($jamaah->tanggal_lahir) : null,
                $jamaah->status_pernikahan
            );

            if ($filterKategori !== null && $filterKategori !== '' && $kode !== $filterKategori) {
                continue;
            }

            $row = $this->mapMember($jamaah, $kode);

            if ($kode === null) {
                $belum['jumlah']++;
                $belum['items'][] = $row;
                continue;
            }

            $groups[$kode]['jumlah']++;
            $groups[$kode]['items'][] = $row;
        }

        return [
            'asumsi_rentang' => collect(JamaahKategoriUmur::VALUES)->map(fn (string $kode) => [
                'kode' => $kode,
                'nama' => JamaahKategoriUmur::LABELS[$kode],
                'grup' => JamaahKategoriUmur::GROUPS[$kode],
                'rentang_usia' => JamaahKategoriUmur::ageRangeLabel($kode),
            ])->values()->all(),
            'kategori' => array_values($groups),
            'belum_diklasifikasi' => $belum,
            'total_aktif' => collect($groups)->sum('jumlah') + $belum['jumlah'],
        ];
    }

    public function syncAll(?User $user = null): int
    {
        $builder = Jamaah::query()->select([
            'id',
            'tanggal_lahir',
            'status_pernikahan',
            'kategori_umur',
        ]);

        if ($user) {
            $this->scopeService->applyJamaahScope($builder, $user);
        }

        $updated = 0;

        $builder->chunkById(200, function ($rows) use (&$updated) {
            foreach ($rows as $jamaah) {
                $kode = JamaahKategoriUmur::classify(
                    $jamaah->tanggal_lahir ? Carbon::parse($jamaah->tanggal_lahir) : null,
                    $jamaah->status_pernikahan
                );

                if ($jamaah->kategori_umur !== $kode) {
                    $jamaah->kategori_umur = $kode;
                    $jamaah->saveQuietly();
                    $updated++;
                }
            }
        });

        return $updated;
    }

    /**
     * @return array<string, mixed>
     */
    private function mapMember(Jamaah $jamaah, ?string $kode = null): array
    {
        $resolved = $kode ?? $jamaah->kategori_umur;

        return [
            'id' => $jamaah->id,
            'nama' => $jamaah->nama,
            'gender' => $jamaah->gender,
            'tanggal_lahir' => $jamaah->tanggal_lahir?->format('Y-m-d'),
            'usia' => $jamaah->tanggal_lahir?->age,
            'status_pernikahan' => $jamaah->status_pernikahan,
            'status_pernikahan_label' => $jamaah->status_pernikahan
                ? (JamaahStatusPernikahan::LABELS[$jamaah->status_pernikahan] ?? $jamaah->status_pernikahan)
                : null,
            'kategori_umur' => $resolved,
            'kategori_umur_label' => JamaahKategoriUmur::label($resolved),
            'wilayah_fung_kelompok' => $jamaah->wilayahFungKelompok ? [
                'id' => $jamaah->wilayahFungKelompok->id,
                'kode' => $jamaah->wilayahFungKelompok->kode,
                'nama' => $jamaah->wilayahFungKelompok->nama,
            ] : null,
        ];
    }
}
