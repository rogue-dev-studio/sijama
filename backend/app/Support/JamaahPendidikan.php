<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:05:00
 */

namespace App\Support;

final class JamaahPendidikan
{
    public const VALUES = [
        'tidak_sekolah',
        'sd',
        'smp',
        'sma',
        'd1_d2_d3',
        's1',
        's2',
        's3',
        'lainnya',
    ];

    public const LABELS = [
        'tidak_sekolah' => 'Tidak sekolah',
        'sd' => 'SD/MI',
        'smp' => 'SMP/MTs',
        'sma' => 'SMA/MA/SMK',
        'd1_d2_d3' => 'D1/D2/D3',
        's1' => 'S1',
        's2' => 'S2',
        's3' => 'S3',
        'lainnya' => 'Lainnya',
    ];
}
