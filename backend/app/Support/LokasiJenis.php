<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:40:00
 */

namespace App\Support;

final class LokasiJenis
{
    public const VALUES = ['masjid', 'gsg', 'ppm', 'aula', 'kantor', 'lainnya'];

    public const LABELS = [
        'masjid' => 'Masjid LDII',
        'gsg' => 'Gedung Serbaguna (GSG)',
        'ppm' => 'PPM',
        'aula' => 'Aula',
        'kantor' => 'Kantor DPW/DPD/DPP',
        'lainnya' => 'Lainnya',
    ];
}
