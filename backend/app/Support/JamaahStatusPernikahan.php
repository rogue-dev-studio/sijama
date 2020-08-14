<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:45:00
 */

namespace App\Support;

final class JamaahStatusPernikahan
{
    public const BELUM_MENIKAH = 'belum_menikah';

    public const SUDAH_MENIKAH = 'sudah_menikah';

    public const CERAI_HIDUP = 'cerai_hidup';

    public const CERAI_MATI = 'cerai_mati';

    public const VALUES = [
        self::BELUM_MENIKAH,
        self::SUDAH_MENIKAH,
        self::CERAI_HIDUP,
        self::CERAI_MATI,
    ];

    public const LABELS = [
        self::BELUM_MENIKAH => 'Belum menikah',
        self::SUDAH_MENIKAH => 'Sudah menikah',
        self::CERAI_HIDUP => 'Cerai hidup',
        self::CERAI_MATI => 'Cerai mati',
    ];
}
