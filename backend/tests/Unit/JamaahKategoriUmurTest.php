<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:30:00
 */

namespace Tests\Unit;

use App\Support\JamaahKategoriUmur;
use App\Support\JamaahStatusPernikahan;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

class JamaahKategoriUmurTest extends TestCase
{
    public function test_youth_bands_ignore_marital_status(): void
    {
        $asOf = Carbon::parse('2026-08-03');

        $this->assertSame('balita', JamaahKategoriUmur::classify(Carbon::parse('2023-01-01'), JamaahStatusPernikahan::SUDAH_MENIKAH, $asOf));
        $this->assertSame('caberawit_a', JamaahKategoriUmur::classify(Carbon::parse('2019-01-01'), null, $asOf));
        $this->assertSame('remaja', JamaahKategoriUmur::classify(Carbon::parse('2007-01-01'), JamaahStatusPernikahan::BELUM_MENIKAH, $asOf));
    }

    public function test_pra_nikah_requires_unmarried(): void
    {
        $asOf = Carbon::parse('2026-08-03');
        $birth = Carbon::parse('1995-05-15');

        $this->assertSame(
            'pra_nikah',
            JamaahKategoriUmur::classify($birth, JamaahStatusPernikahan::BELUM_MENIKAH, $asOf)
        );
        $this->assertSame(
            'dewasa',
            JamaahKategoriUmur::classify($birth, JamaahStatusPernikahan::SUDAH_MENIKAH, $asOf)
        );
        $this->assertNull(JamaahKategoriUmur::classify($birth, null, $asOf));
        $this->assertSame(
            'dewasa',
            JamaahKategoriUmur::classify($birth, JamaahStatusPernikahan::CERAI_HIDUP, $asOf)
        );
        $this->assertSame(
            'dewasa',
            JamaahKategoriUmur::classify($birth, JamaahStatusPernikahan::CERAI_MATI, $asOf)
        );
    }

    public function test_lansia_by_age(): void
    {
        $asOf = Carbon::parse('2026-08-03');
        $birth = Carbon::parse('1960-01-01');

        $this->assertSame(
            'lansia',
            JamaahKategoriUmur::classify($birth, JamaahStatusPernikahan::SUDAH_MENIKAH, $asOf)
        );
        $this->assertSame(
            'lansia',
            JamaahKategoriUmur::classify($birth, JamaahStatusPernikahan::BELUM_MENIKAH, $asOf)
        );
    }
}
