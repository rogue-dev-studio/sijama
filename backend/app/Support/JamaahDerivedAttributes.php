<?php

namespace App\Support;

use App\Models\Jamaah;
use App\Models\LookupM;

final class JamaahDerivedAttributes
{
    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public static function enrich(array $attributes, ?Jamaah $existing = null): array
    {
        if (($attributes['no_hp'] ?? null) === '') {
            $attributes['no_hp'] = null;
        }
        if (($attributes['email'] ?? null) === '') {
            $attributes['email'] = null;
        }

        $tanggalLahir = $attributes['tanggal_lahir'] ?? $existing?->tanggal_lahir;
        $statusPernikahan = $attributes['status_pernikahan'] ?? $existing?->status_pernikahan;

        if ($tanggalLahir !== null) {
            $attributes['kategori_umur'] = JamaahKategoriUmur::classify(
                $tanggalLahir,
                $statusPernikahan
            );
        }

        $pekerjaanId = $attributes['pekerjaan_id'] ?? $existing?->pekerjaan_id;
        if ($pekerjaanId) {
            $nama = LookupM::query()->whereKey($pekerjaanId)->value('lookup_name');
            if ($nama) {
                $attributes['pekerjaan'] = $nama;
            }
        }

        return $attributes;
    }
}
