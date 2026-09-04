<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:21:51
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:21:51
 */

namespace Tests\Feature;

use App\Models\Daerah;
use App\Models\Dapukan;
use App\Models\Jamaah;
use App\Models\Kelompok;
use App\Models\Desa;
use App\Models\Pusat;
use App\Models\User;
use App\Services\ScopeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Tests\TestCase;

class ScopeServiceTest extends TestCase
{
    use RefreshDatabase;

    private function makeHierarchy(): array
    {
        $pusatA = Pusat::query()->create([
            'kode' => 'P-A',
            'nama' => 'Pusat A',
            'is_active' => true,
        ]);
        $pusatB = Pusat::query()->create([
            'kode' => 'P-B',
            'nama' => 'Pusat B',
            'is_active' => true,
        ]);
        $daerahA = Daerah::query()->create([
            'wilayah_fung_pusat_id' => $pusatA->id,
            'kode' => 'D-A',
            'nama' => 'Daerah A',
            'is_active' => true,
        ]);
        $daerahB = Daerah::query()->create([
            'wilayah_fung_pusat_id' => $pusatB->id,
            'kode' => 'D-B',
            'nama' => 'Daerah B',
            'is_active' => true,
        ]);
        $desaA = Desa::query()->create([
            'wilayah_fung_daerah_id' => $daerahA->id,
            'kode' => 'DES-A',
            'nama' => 'Desa A',
            'is_active' => true,
        ]);
        $kelompokA = Kelompok::query()->create([
            'wilayah_fung_desa_id' => $desaA->id,
            'kode' => 'KEL-A',
            'nama' => 'Kelompok A',
            'is_active' => true,
        ]);
        $jamaahA = Jamaah::query()->create([
            'wilayah_fung_kelompok_id' => $kelompokA->id,
            'nik' => '1111222233334444',
            'nama' => 'Jamaah A',
            'gender' => 'L',
            'rt' => '01',
            'rw' => '01',
            'no_hp' => '081111111111',
            'status' => 'aktif',
        ]);

        return compact('pusatA', 'pusatB', 'daerahA', 'daerahB', 'desaA', 'kelompokA', 'jamaahA');
    }

    private function userWithTingkat(string $slug, string $tingkat, array $scopeIds = []): User
    {
        $dapukan = Dapukan::query()->create([
            'slug' => $slug,
            'nama' => $slug,
            'tingkat' => $tingkat,
            'urutan' => 10,
            'is_system' => false,
            'is_active' => true,
        ]);

        return User::createManaged([
            'name' => $slug,
            'username' => $slug,
            'email' => $slug.'@sijama.test',
            'password' => 'password',
            'dapukan_id' => $dapukan->id,
            'wilayah_fung_pusat_id' => $scopeIds['wilayah_fung_pusat_id'] ?? null,
            'wilayah_fung_daerah_id' => $scopeIds['wilayah_fung_daerah_id'] ?? null,
            'wilayah_fung_desa_id' => $scopeIds['wilayah_fung_desa_id'] ?? null,
            'wilayah_fung_kelompok_id' => $scopeIds['wilayah_fung_kelompok_id'] ?? null,
            'is_active' => true,
        ]);
    }

    public function test_kelompok_user_can_access_jamaah_in_own_kelompok_only(): void
    {
        $tree = $this->makeHierarchy();
        $scope = app(ScopeService::class);
        $user = $this->userWithTingkat('scope_kelompok', 'kelompok', [
            'wilayah_fung_kelompok_id' => $tree['kelompokA']->id,
            'wilayah_fung_desa_id' => $tree['desaA']->id,
            'wilayah_fung_daerah_id' => $tree['daerahA']->id,
            'wilayah_fung_pusat_id' => $tree['pusatA']->id,
        ]);

        $scope->assertJamaahInScope($user, $tree['jamaahA']);

        $other = Jamaah::query()->create([
            'nik' => '5555666677778888',
            'nama' => 'Jamaah Other',
            'gender' => 'P',
            'rt' => '02',
            'rw' => '02',
            'no_hp' => '082222222222',
            'status' => 'aktif',
        ]);

        $this->expectException(AccessDeniedHttpException::class);
        $scope->assertJamaahInScope($user, $other);
    }

    public function test_daerah_user_denied_other_pusat_daerah(): void
    {
        $tree = $this->makeHierarchy();
        $scope = app(ScopeService::class);
        $user = $this->userWithTingkat('scope_daerah', 'daerah', [
            'wilayah_fung_daerah_id' => $tree['daerahA']->id,
            'wilayah_fung_pusat_id' => $tree['pusatA']->id,
        ]);

        $scope->assertDaerahInScope($user, $tree['daerahA']);

        $this->expectException(AccessDeniedHttpException::class);
        $scope->assertDaerahInScope($user, $tree['daerahB']);
    }

    public function test_pusat_list_scoped_for_pusat_user(): void
    {
        $tree = $this->makeHierarchy();
        $scope = app(ScopeService::class);
        $user = $this->userWithTingkat('scope_pusat', 'pusat', [
            'wilayah_fung_pusat_id' => $tree['pusatA']->id,
        ]);

        $ids = $scope->applyPusatScope(Pusat::query(), $user)->pluck('id')->all();

        $this->assertSame([$tree['pusatA']->id], $ids);
    }

    public function test_global_user_sees_all_pusat(): void
    {
        $tree = $this->makeHierarchy();
        $scope = app(ScopeService::class);
        $user = $this->userWithTingkat('scope_global', 'global');

        $scoped = $scope->applyPusatScope(Pusat::query(), $user)->orderBy('id')->pluck('id')->all();
        $all = Pusat::query()->orderBy('id')->pluck('id')->all();

        $this->assertSame($all, $scoped);
        $this->assertContains($tree['pusatA']->id, $scoped);
        $this->assertContains($tree['pusatB']->id, $scoped);
    }
}
