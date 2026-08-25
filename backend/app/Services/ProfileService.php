<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 16:44:59
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-24 18:05:00
 */

namespace App\Services;

use App\Http\Resources\JamaahResource;
use App\Http\Resources\UserResource;
use App\Models\AdmDesaKelurahan;
use App\Models\AdmKabupatenKota;
use App\Models\AdmKecamatan;
use App\Models\AdmNegara;
use App\Models\AdmProvinsi;
use App\Models\Jamaah;
use App\Models\Pekerjaan;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class ProfileService
{
    public function show(User $user): array
    {
        $user->loadMissing(['dapukan', 'jamaah.dapukan', 'pusat', 'daerah', 'desa', 'kelompok']);

        $jamaah = null;
        $admChain = null;

        if ($user->jamaah_id) {
            $model = Jamaah::query()
                ->with([
                    'kelompok.desa.daerah',
                    'admDesaKelurahan.kecamatan.kabupatenKota.provinsi.negara',
                    'pekerjaanRef',
                    'dapukan:id,slug,nama,tingkat',
                ])
                ->find($user->jamaah_id);

            if ($model) {
                $jamaah = (new JamaahResource($model))->resolve();
                $admChain = $this->buildAdmChain($model);
            }
        }

        return [
            'user' => (new UserResource($user))->resolve(),
            'jamaah' => $jamaah,
            'can_edit_jamaah' => $jamaah !== null,
            'adm_chain' => $admChain,
            'lookups' => [
                'pekerjaan' => Pekerjaan::query()
                    ->where('is_active', true)
                    ->orderBy('nama')
                    ->get(['id', 'nama']),
                'negara' => AdmNegara::query()
                    ->where('is_active', true)
                    ->orderBy('nama')
                    ->get(['id', 'kode', 'nama']),
            ],
        ];
    }

    /**
     * Cascade wilayah administratif untuk form profil sendiri (tanpa permission master).
     *
     * @return array<int, array{id: int, kode: string, nama: string}>
     */
    public function wilayahOptions(string $level, ?int $parentId = null): array
    {
        return match ($level) {
            'negara' => AdmNegara::query()
                ->where('is_active', true)
                ->orderBy('nama')
                ->get(['id', 'kode', 'nama'])
                ->map(fn (AdmNegara $item) => [
                    'id' => $item->id,
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ])
                ->values()
                ->all(),
            'provinsi' => AdmProvinsi::query()
                ->where('is_active', true)
                ->when($parentId, fn ($q) => $q->where('negara_id', $parentId))
                ->orderBy('nama')
                ->get(['id', 'kode', 'nama'])
                ->map(fn (AdmProvinsi $item) => [
                    'id' => $item->id,
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ])
                ->values()
                ->all(),
            'kabupaten_kota' => AdmKabupatenKota::query()
                ->where('is_active', true)
                ->when($parentId, fn ($q) => $q->where('provinsi_id', $parentId))
                ->orderBy('nama')
                ->get(['id', 'kode', 'nama'])
                ->map(fn (AdmKabupatenKota $item) => [
                    'id' => $item->id,
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ])
                ->values()
                ->all(),
            'kecamatan' => AdmKecamatan::query()
                ->where('is_active', true)
                ->when($parentId, fn ($q) => $q->where('kabupaten_kota_id', $parentId))
                ->orderBy('nama')
                ->get(['id', 'kode', 'nama'])
                ->map(fn (AdmKecamatan $item) => [
                    'id' => $item->id,
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ])
                ->values()
                ->all(),
            'desa_kelurahan' => AdmDesaKelurahan::query()
                ->where('is_active', true)
                ->when($parentId, fn ($q) => $q->where('kecamatan_id', $parentId))
                ->orderBy('nama')
                ->get(['id', 'kode', 'nama'])
                ->map(fn (AdmDesaKelurahan $item) => [
                    'id' => $item->id,
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ])
                ->values()
                ->all(),
            default => throw ValidationException::withMessages([
                'level' => ['Level wilayah tidak valid.'],
            ]),
        };
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateJamaah(User $user, array $data): array
    {
        if (! $user->jamaah_id) {
            throw ValidationException::withMessages([
                'jamaah' => ['Akun belum ditautkan ke data jamaah.'],
            ]);
        }

        $jamaah = Jamaah::query()->find($user->jamaah_id);
        if (! $jamaah) {
            throw ValidationException::withMessages([
                'jamaah' => ['Data jamaah tidak ditemukan.'],
            ]);
        }

        if (array_key_exists('pekerjaan_id', $data)) {
            $pekerjaanId = $data['pekerjaan_id'];
            if ($pekerjaanId) {
                $pekerjaan = Pekerjaan::query()->find($pekerjaanId);
                $data['pekerjaan'] = $pekerjaan?->nama;
            } else {
                $data['pekerjaan_id'] = null;
                $data['pekerjaan'] = null;
            }
        }

        $jamaah->update($data);

        $user->update([
            'name' => $jamaah->nama,
            'email' => $jamaah->email,
        ]);

        return $this->show($user->fresh());
    }

    /**
     * @return array{
     *   negara_id: int|null,
     *   provinsi_id: int|null,
     *   kabupaten_kota_id: int|null,
     *   kecamatan_id: int|null,
     *   desa_kelurahan_id: int|null,
     *   labels: array{negara: string|null, provinsi: string|null, kabupaten_kota: string|null, kecamatan: string|null, desa_kelurahan: string|null}
     * }|null
     */
    private function buildAdmChain(Jamaah $jamaah): ?array
    {
        if (! $jamaah->adm_desa_kelurahan_id || ! $jamaah->relationLoaded('admDesaKelurahan') || ! $jamaah->admDesaKelurahan) {
            return [
                'negara_id' => null,
                'provinsi_id' => null,
                'kabupaten_kota_id' => null,
                'kecamatan_id' => null,
                'desa_kelurahan_id' => null,
                'labels' => [
                    'negara' => null,
                    'provinsi' => null,
                    'kabupaten_kota' => null,
                    'kecamatan' => null,
                    'desa_kelurahan' => null,
                ],
            ];
        }

        $desa = $jamaah->admDesaKelurahan;
        $kecamatan = $desa->kecamatan;
        $kabupaten = $kecamatan?->kabupatenKota;
        $provinsi = $kabupaten?->provinsi;
        $negara = $provinsi?->negara;

        return [
            'negara_id' => $negara?->id,
            'provinsi_id' => $provinsi?->id,
            'kabupaten_kota_id' => $kabupaten?->id,
            'kecamatan_id' => $kecamatan?->id,
            'desa_kelurahan_id' => $desa->id,
            'labels' => [
                'negara' => $negara?->nama,
                'provinsi' => $provinsi?->nama,
                'kabupaten_kota' => $kabupaten?->nama,
                'kecamatan' => $kecamatan?->nama,
                'desa_kelurahan' => $desa->nama,
            ],
        ];
    }
}
