<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:30:00
 */

namespace App\Services;

use App\Models\Jamaah;
use App\Models\User;
use App\Support\JamaahKategoriUmur;
use App\Support\JamaahStatusPernikahan;
use Carbon\Carbon;

class KategoriUmurService
{
    public function __construct(private readonly ScopeService $scopeService) {}

    public function summary(User $user, ?string $filterKategori = null): array
    {
        $builder = Jamaah::query()
            ->select([
                'id',
                'nama',
                'gender',
                'tanggal_lahir',
                'status_pernikahan',
                'kelompok_id',
                'status',
            ])
            ->with('kelompok:id,kode,nama')
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

            $row = [
                'id' => $jamaah->id,
                'nama' => $jamaah->nama,
                'gender' => $jamaah->gender,
                'tanggal_lahir' => $jamaah->tanggal_lahir?->format('Y-m-d'),
                'usia' => $jamaah->tanggal_lahir?->age,
                'status_pernikahan' => $jamaah->status_pernikahan,
                'status_pernikahan_label' => $jamaah->status_pernikahan
                    ? (JamaahStatusPernikahan::LABELS[$jamaah->status_pernikahan] ?? $jamaah->status_pernikahan)
                    : null,
                'kelompok' => $jamaah->kelompok ? [
                    'id' => $jamaah->kelompok->id,
                    'kode' => $jamaah->kelompok->kode,
                    'nama' => $jamaah->kelompok->nama,
                ] : null,
            ];

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
}
