<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:50:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:50:00
 */

namespace Tests\Unit;

use App\Models\Daerah;
use App\Models\Desa;
use App\Models\Jamaah;
use App\Models\Kelompok;
use App\Models\Pusat;
use App\Models\User;
use App\Services\KelompokService;
use App\Services\ScopeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Mockery;
use Tests\TestCase;

class KelompokDeleteGuardTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_cannot_delete_kelompok_when_soft_deleted_jamaah_exists(): void
    {
        $pusat = Pusat::query()->create([
            'kode' => 'pusat-1',
            'nama' => 'Pusat 1',
            'is_active' => true,
        ]);
        $daerah = Daerah::query()->create([
            'wilayah_fung_pusat_id' => $pusat->id,
            'kode' => 'd-1',
            'nama' => 'Daerah 1',
            'is_active' => true,
        ]);
        $desa = Desa::query()->create([
            'wilayah_fung_daerah_id' => $daerah->id,
            'kode' => 'desa-1',
            'nama' => 'Desa 1',
            'is_active' => true,
        ]);
        $kelompok = Kelompok::query()->create([
            'wilayah_fung_desa_id' => $desa->id,
            'kode' => 'kel-1',
            'nama' => 'Kelompok 1',
            'is_active' => true,
        ]);
        $jamaah = Jamaah::query()->create([
            'wilayah_fung_kelompok_id' => $kelompok->id,
            'nik' => '1234567890123456',
            'nama' => 'Test Jamaah',
            'gender' => 'L',
            'rt' => '01',
            'rw' => '01',
            'no_hp' => '081234567890',
            'status' => 'aktif',
        ]);
        $jamaah->delete();

        $scope = Mockery::mock(ScopeService::class);
        $scope->shouldReceive('assertKelompokInScope')->once();

        $user = new User;
        $service = new KelompokService($scope);

        $this->expectException(ValidationException::class);
        $service->delete($kelompok->id, $user);
    }
}
