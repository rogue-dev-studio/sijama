<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 12:28:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 12:28:00
 */

namespace App\Support;

final class LookupTypes
{
    public const PEKERJAAN = 'pekerjaan';

    public const JENIS_KELAMIN = 'jenis_kelamin';

    public const GOLONGAN_DARAH = 'golongan_darah';

    public const STATUS_PERNIKAHAN = 'status_pernikahan';

    public const PENDIDIKAN = 'pendidikan';

    public const HUBUNGAN_KELUARGA = 'hubungan_keluarga';

    public const HARI_MINGGU = 'hari_minggu';

    /** Master lookup tipe cetakan dokumen (nama + value = jenis cetakan). */
    public const KONFIG_DOKUMEN = 'konfig_dokumen';

    public const JAMAAH_FORM_TYPES = [
        self::PEKERJAAN,
        self::JENIS_KELAMIN,
        self::GOLONGAN_DARAH,
        self::STATUS_PERNIKAHAN,
        self::PENDIDIKAN,
    ];

    /** Types exposed via GET /lookup-options (form dropdowns). */
    public const OPTION_TYPES = [
        ...self::JAMAAH_FORM_TYPES,
        self::HUBUNGAN_KELUARGA,
        self::HARI_MINGGU,
    ];

    public const LABELS = [
        self::PEKERJAAN => 'Pekerjaan',
        self::JENIS_KELAMIN => 'Jenis kelamin',
        self::GOLONGAN_DARAH => 'Golongan darah',
        self::STATUS_PERNIKAHAN => 'Status pernikahan',
        self::PENDIDIKAN => 'Pendidikan',
        self::HUBUNGAN_KELUARGA => 'Hubungan keluarga',
        self::HARI_MINGGU => 'Hari minggu',
        self::KONFIG_DOKUMEN => 'Konfigurasi dokumen',
    ];
}
