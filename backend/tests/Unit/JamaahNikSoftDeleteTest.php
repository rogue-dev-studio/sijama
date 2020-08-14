<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:49:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:49:00
 */

namespace Tests\Unit;

use App\Models\Jamaah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class JamaahNikSoftDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_nik_can_be_reused_after_soft_delete_on_pgsql(): void
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            $this->markTestSkipped('Partial unique index applies on PostgreSQL.');
        }

        $jamaah = Jamaah::query()->create([
            'nik' => '9988776655443322',
            'nama' => 'A',
            'gender' => 'L',
            'rt' => '01',
            'rw' => '01',
            'no_hp' => '081111111111',
            'status' => 'aktif',
        ]);
        $jamaah->delete();

        $recreated = Jamaah::query()->create([
            'nik' => '9988776655443322',
            'nama' => 'B',
            'gender' => 'P',
            'rt' => '02',
            'rw' => '02',
            'no_hp' => '082222222222',
            'status' => 'aktif',
        ]);

        $this->assertNotNull($recreated->id);
        $this->assertSame('9988776655443322', $recreated->nik);
    }
}
