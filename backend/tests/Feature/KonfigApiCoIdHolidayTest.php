<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 18:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 18:00:00
 */

namespace Tests\Feature;

use App\Models\KonfigSystemK;
use App\Models\User;
use App\Support\SuperAdminAccess;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class KonfigApiCoIdHolidayTest extends TestCase
{
    use RefreshDatabase;

    public function test_konfig_exposes_api_co_id_holiday_fields(): void
    {
        $this->seed(RbacSeeder::class);
        $admin = User::query()->where('username', SuperAdminAccess::RESERVED_USERNAME)->firstOrFail();

        KonfigSystemK::query()->create([
            'created_date' => now(),
            'modified_count' => 0,
            'is_active' => true,
            'is_deleted' => false,
            'api_co_id_holiday_enabled' => true,
            'api_co_id_api_key' => 'secret-key',
            'api_co_id_holiday_base_url' => 'https://use.api.co.id/holidays/indonesia',
            'api_co_id_holiday_last_synced_at' => now(),
            'api_co_id_holiday_last_sync_count' => 12,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/aplikasi/konfig')
            ->assertOk();

        $response->assertJsonPath('data.api_co_id_holiday_enabled', true);
        $response->assertJsonPath('data.api_co_id_api_key_set', true);
        $response->assertJsonPath('data.api_co_id_holiday_base_url', 'https://use.api.co.id/holidays/indonesia');
        $response->assertJsonPath('data.api_co_id_holiday_last_sync_count', 12);
        $response->assertJsonMissingPath('data.api_co_id_api_key');
    }

    public function test_sync_hari_libur_endpoint_imports_and_records_metadata(): void
    {
        $this->seed(RbacSeeder::class);
        $admin = User::query()->where('username', SuperAdminAccess::RESERVED_USERNAME)->firstOrFail();

        KonfigSystemK::query()->create([
            'created_date' => now(),
            'modified_count' => 0,
            'is_active' => true,
            'is_deleted' => false,
            'api_co_id_holiday_enabled' => true,
            'api_co_id_api_key' => 'secret-key',
            'api_co_id_holiday_base_url' => 'https://use.api.co.id/holidays/indonesia',
        ]);

        Http::fake([
            'use.api.co.id/holidays/indonesia*' => Http::response([
                'is_success' => true,
                'data' => [
                    [
                        'date' => '2026-01-01',
                        'name' => 'Tahun Baru Masehi',
                        'is_joint_holiday' => false,
                        'is_observance' => false,
                    ],
                ],
            ]),
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/aplikasi/konfig/hari-libur/sync', ['year' => 2026])
            ->assertOk()
            ->assertJsonPath('data.results.0.year', 2026)
            ->assertJsonPath('data.results.0.synced', 1)
            ->assertJsonPath('data.last_sync_count', 1);

        $this->assertDatabaseHas('hari_libur_m', [
            'tanggal' => '2026-01-01',
            'nama' => 'Tahun Baru Masehi',
            'jenis' => 'nasional',
        ]);

        $konfig = KonfigSystemK::query()->firstOrFail();
        $this->assertNotNull($konfig->api_co_id_holiday_last_synced_at);
        $this->assertSame(1, $konfig->api_co_id_holiday_last_sync_count);
    }
}
