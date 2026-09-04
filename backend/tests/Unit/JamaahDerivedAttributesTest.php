<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 17:43:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:43:00
 */

namespace Tests\Unit;

use App\Support\JamaahDerivedAttributes;
use App\Support\JamaahStatusPernikahan;
use PHPUnit\Framework\TestCase;

class JamaahDerivedAttributesTest extends TestCase
{
    public function test_enrich_classifies_string_tanggal_lahir(): void
    {
        $result = JamaahDerivedAttributes::enrich([
            'tanggal_lahir' => '1993-12-24',
            'status_pernikahan' => JamaahStatusPernikahan::SUDAH_MENIKAH,
            'no_hp' => '',
            'email' => '',
        ]);

        $this->assertSame('dewasa', $result['kategori_umur']);
        $this->assertNull($result['no_hp']);
        $this->assertNull($result['email']);
    }
}
