<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:30:00
 */

namespace App\Support;

use Carbon\CarbonInterface;

final class JamaahKategoriUmur
{
    public const LANSIA_MIN_AGE = 60;

    public const DEWASA_MIN_AGE = 21;

    public const VALUES = [
        'bayi',
        'balita',
        'paud',
        'caberawit_a',
        'caberawit_b',
        'caberawit_c',
        'pra_remaja',
        'remaja',
        'pra_nikah',
        'dewasa',
        'lansia',
    ];

    public const LABELS = [
        'bayi' => 'Bayi',
        'balita' => 'Balita',
        'paud' => 'PAUD',
        'caberawit_a' => 'Caberawit A',
        'caberawit_b' => 'Caberawit B',
        'caberawit_c' => 'Caberawit C',
        'pra_remaja' => 'Pra Remaja',
        'remaja' => 'Remaja',
        'pra_nikah' => 'Pra Nikah',
        'dewasa' => 'Dewasa',
        'lansia' => 'Lansia',
    ];

    public const GROUPS = [
        'bayi' => 'Caberawit',
        'balita' => 'Caberawit',
        'paud' => 'Caberawit',
        'caberawit_a' => 'Caberawit',
        'caberawit_b' => 'Caberawit',
        'caberawit_c' => 'Caberawit',
        'pra_remaja' => 'Muda-mudi',
        'remaja' => 'Muda-mudi',
        'pra_nikah' => 'Muda-mudi',
        'dewasa' => 'Dewasa',
        'lansia' => 'Lansia',
    ];

    /** Inclusive age ranges for youth bands only. */
    public const YOUTH_AGE_RANGES = [
        'bayi' => [0, 1],
        'balita' => [2, 4],
        'paud' => [5, 5],
        'caberawit_a' => [6, 8],
        'caberawit_b' => [9, 11],
        'caberawit_c' => [12, 14],
        'pra_remaja' => [15, 17],
        'remaja' => [18, 20],
    ];

    public static function classify(
        ?CarbonInterface $tanggalLahir,
        ?string $statusPernikahan = null,
        ?CarbonInterface $asOf = null,
    ): ?string {
        if ($tanggalLahir === null) {
            return null;
        }

        $age = $asOf
            ? (int) $tanggalLahir->diffInYears($asOf)
            : (int) $tanggalLahir->age;

        foreach (self::YOUTH_AGE_RANGES as $kode => [$min, $max]) {
            if ($age >= $min && $age <= $max) {
                return $kode;
            }
        }

        if ($age >= self::LANSIA_MIN_AGE) {
            return 'lansia';
        }

        if ($age < self::DEWASA_MIN_AGE) {
            return null;
        }

        if ($statusPernikahan === JamaahStatusPernikahan::BELUM_MENIKAH) {
            return 'pra_nikah';
        }

        if (in_array($statusPernikahan, [
            JamaahStatusPernikahan::SUDAH_MENIKAH,
            JamaahStatusPernikahan::CERAI_HIDUP,
            JamaahStatusPernikahan::CERAI_MATI,
        ], true)) {
            return 'dewasa';
        }

        return null;
    }

    public static function label(?string $kode): string
    {
        if ($kode === null || $kode === '') {
            return 'Belum diklasifikasi';
        }

        return self::LABELS[$kode] ?? $kode;
    }

    public static function ageRangeLabel(string $kode): string
    {
        return match ($kode) {
            'pra_nikah' => '21–59 tahun · belum menikah',
            'dewasa' => '21–59 tahun · sudah menikah / cerai',
            'lansia' => self::LANSIA_MIN_AGE.'+ tahun',
            default => self::youthRangeLabel($kode),
        };
    }

    private static function youthRangeLabel(string $kode): string
    {
        [$min, $max] = self::YOUTH_AGE_RANGES[$kode] ?? [null, null];

        if ($min === null) {
            return '—';
        }

        if ($min === $max) {
            return "{$min} tahun";
        }

        return "{$min}–{$max} tahun";
    }
}
