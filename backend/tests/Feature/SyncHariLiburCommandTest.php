<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 17:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 17:50:00
 */

namespace Tests\Feature;

use App\Models\HariLibur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SyncHariLiburCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_imports_nasional_and_cuti_bersama_and_skips_observance(): void
    {
        config([
            'integrations.api_co_id.api_key' => 'test-api-key',
            'integrations.api_co_id.holiday_base_url' => 'https://use.api.co.id/holidays/indonesia',
        ]);

        Http::fake([
            'use.api.co.id/holidays/indonesia*' => Http::response([
                'is_success' => true,
                'data' => [
                    [
                        'date' => '2026-01-01',
                        'name' => 'Tahun Baru Masehi',
                        'type' => 'Public Holiday',
                        'is_joint_holiday' => false,
                        'is_observance' => false,
                    ],
                    [
                        'date' => '2026-01-19',
                        'name' => 'Cuti Bersama Imlek',
                        'type' => 'Joint Holiday',
                        'is_joint_holiday' => true,
                        'is_observance' => false,
                    ],
                    [
                        'date' => '2026-02-01',
                        'name' => 'Hari Peringatan',
                        'type' => 'Observance',
                        'is_joint_holiday' => false,
                        'is_observance' => true,
                    ],
                ],
            ]),
        ]);

        $this->artisan('hari-libur:sync', ['--year' => 2026])
            ->assertSuccessful();

        $this->assertDatabaseCount('hari_libur_m', 2);
        $this->assertDatabaseHas('hari_libur_m', [
            'tanggal' => '2026-01-01',
            'nama' => 'Tahun Baru Masehi',
            'jenis' => 'nasional',
            'is_active' => true,
        ]);
        $this->assertDatabaseHas('hari_libur_m', [
            'tanggal' => '2026-01-19',
            'nama' => 'Cuti Bersama Imlek',
            'jenis' => 'cuti_bersama',
            'is_active' => true,
        ]);
        $this->assertNull(HariLibur::query()->where('tanggal', '2026-02-01')->first());

        Http::assertSent(function ($request) {
            return $request->hasHeader('x-api-co-id', 'test-api-key')
                && $request['year'] === 2026;
        });
    }

    public function test_sync_fails_when_api_key_missing(): void
    {
        config(['integrations.api_co_id.api_key' => null]);

        $this->artisan('hari-libur:sync', ['--year' => 2026])
            ->assertFailed();
    }
}
