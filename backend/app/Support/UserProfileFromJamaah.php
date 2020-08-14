<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:40:00
 */

namespace App\Support;

use App\Models\Jamaah;
use Illuminate\Validation\ValidationException;

final class UserProfileFromJamaah
{
    /**
     * @return array{
     *   name: string,
     *   email: ?string,
     *   dapukan_id: int,
     *   pusat_id: ?int,
     *   daerah_id: ?int,
     *   desa_id: ?int,
     *   kelompok_id: ?int
     * }
     */
    public static function resolve(Jamaah $jamaah): array
    {
        $jamaah->loadMissing(['dapukan', 'kelompok.desa.daerah']);

        if ($jamaah->dapukan->isEmpty()) {
            throw ValidationException::withMessages([
                'jamaah_id' => ['Jamaah belum memiliki dapukan. Tetapkan dapukan di master jamaah terlebih dahulu.'],
            ]);
        }

        $primary = DapukanTingkat::broadest($jamaah->dapukan);
        if (! $primary) {
            throw ValidationException::withMessages([
                'jamaah_id' => ['Dapukan jamaah tidak valid.'],
            ]);
        }

        $kelompok = $jamaah->kelompok;
        $desa = $kelompok?->desa;
        $daerah = $desa?->daerah;
        $tingkat = $primary->tingkat;

        $scope = [
            'pusat_id' => null,
            'daerah_id' => null,
            'desa_id' => null,
            'kelompok_id' => null,
        ];

        if ($tingkat === 'pusat') {
            $scope['pusat_id'] = $daerah?->pusat_id;
            if (! $scope['pusat_id']) {
                throw ValidationException::withMessages([
                    'jamaah_id' => ['Kelompok jamaah belum terhubung ke pusat untuk dapukan tingkat pusat.'],
                ]);
            }
        } elseif ($tingkat === 'daerah') {
            $scope['daerah_id'] = $desa?->daerah_id;
            if (! $scope['daerah_id']) {
                throw ValidationException::withMessages([
                    'jamaah_id' => ['Kelompok jamaah belum terhubung ke daerah untuk dapukan tingkat daerah.'],
                ]);
            }
        } elseif ($tingkat === 'desa') {
            $scope['daerah_id'] = $desa?->daerah_id;
            $scope['desa_id'] = $kelompok?->desa_id;
            if (! $scope['daerah_id'] || ! $scope['desa_id']) {
                throw ValidationException::withMessages([
                    'jamaah_id' => ['Kelompok jamaah belum lengkap untuk dapukan tingkat desa.'],
                ]);
            }
        } elseif ($tingkat === 'kelompok') {
            $scope['daerah_id'] = $desa?->daerah_id;
            $scope['desa_id'] = $kelompok?->desa_id;
            $scope['kelompok_id'] = $jamaah->kelompok_id;
            if (! $scope['daerah_id'] || ! $scope['desa_id'] || ! $scope['kelompok_id']) {
                throw ValidationException::withMessages([
                    'jamaah_id' => ['Jamaah belum memiliki kelompok untuk dapukan tingkat kelompok.'],
                ]);
            }
        }

        return [
            'name' => $jamaah->nama,
            'email' => $jamaah->email,
            'dapukan_id' => $primary->id,
            ...$scope,
        ];
    }
}
