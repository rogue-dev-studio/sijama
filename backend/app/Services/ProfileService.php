<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 16:44:59
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 16:44:59
 */

namespace App\Services;

use App\Http\Resources\JamaahResource;
use App\Http\Resources\UserResource;
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
        if ($user->jamaah_id) {
            $model = Jamaah::query()
                ->with([
                    'kelompok.desa.daerah',
                    'admDesaKelurahan',
                    'pekerjaanRef',
                    'dapukan:id,kode,nama,tingkat',
                ])
                ->find($user->jamaah_id);

            $jamaah = $model ? (new JamaahResource($model))->resolve() : null;
        }

        return [
            'user' => (new UserResource($user))->resolve(),
            'jamaah' => $jamaah,
            'can_edit_jamaah' => $jamaah !== null,
            'lookups' => [
                'pekerjaan' => Pekerjaan::query()
                    ->where('is_active', true)
                    ->orderBy('nama')
                    ->get(['id', 'kode', 'nama']),
            ],
        ];
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
}
