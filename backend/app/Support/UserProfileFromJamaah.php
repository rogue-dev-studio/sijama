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
     *   wilayah_fung_pusat_id: ?int,
     *   wilayah_fung_daerah_id: ?int,
     *   wilayah_fung_desa_id: ?int,
     *   wilayah_fung_kelompok_id: ?int
     * }
     */
    public static function resolve(Jamaah $jamaah): array
    {
        $jamaah->loadMissing(['dapukan', 'wilayahFungKelompok.wilayahFungDesa.wilayahFungDaerah']);

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

        $kelompok = $jamaah->wilayahFungKelompok;
        $desa = $kelompok?->wilayahFungDesa;
        $daerah = $desa?->wilayahFungDaerah;
        $tingkat = $primary->tingkat;

        $scope = [
            'wilayah_fung_pusat_id' => null,
            'wilayah_fung_daerah_id' => null,
            'wilayah_fung_desa_id' => null,
            'wilayah_fung_kelompok_id' => null,
        ];

        if ($tingkat === 'pusat') {
            $scope['wilayah_fung_pusat_id'] = $daerah?->wilayah_fung_pusat_id;
            if (! $scope['wilayah_fung_pusat_id']) {
                throw ValidationException::withMessages([
                    'jamaah_id' => ['Kelompok jamaah belum terhubung ke pusat untuk dapukan tingkat pusat.'],
                ]);
            }
        } elseif ($tingkat === 'daerah') {
            $scope['wilayah_fung_daerah_id'] = $desa?->wilayah_fung_daerah_id;
            if (! $scope['wilayah_fung_daerah_id']) {
                throw ValidationException::withMessages([
                    'jamaah_id' => ['Kelompok jamaah belum terhubung ke daerah untuk dapukan tingkat daerah.'],
                ]);
            }
        } elseif ($tingkat === 'desa') {
            $scope['wilayah_fung_daerah_id'] = $desa?->wilayah_fung_daerah_id;
            $scope['wilayah_fung_desa_id'] = $kelompok?->wilayah_fung_desa_id;
            if (! $scope['wilayah_fung_daerah_id'] || ! $scope['wilayah_fung_desa_id']) {
                throw ValidationException::withMessages([
                    'jamaah_id' => ['Kelompok jamaah belum lengkap untuk dapukan tingkat desa.'],
                ]);
            }
        } elseif ($tingkat === 'kelompok') {
            $scope['wilayah_fung_daerah_id'] = $desa?->wilayah_fung_daerah_id;
            $scope['wilayah_fung_desa_id'] = $kelompok?->wilayah_fung_desa_id;
            $scope['wilayah_fung_kelompok_id'] = $jamaah->wilayah_fung_kelompok_id;
            if (! $scope['wilayah_fung_daerah_id'] || ! $scope['wilayah_fung_desa_id'] || ! $scope['wilayah_fung_kelompok_id']) {
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
