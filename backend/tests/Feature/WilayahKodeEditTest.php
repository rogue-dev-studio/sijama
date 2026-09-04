<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 14:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 14:45:00
 */

namespace Tests\Feature;

use App\Models\AdmNegara;
use App\Models\Dapukan;
use App\Models\Pusat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesAuthorizedUser;
use Tests\TestCase;

class WilayahKodeEditTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;

    public function test_superadmin_can_update_wilayah_adm_kode(): void
    {
        $negara = AdmNegara::query()->create([
            'kode' => 'XX',
            'nama' => 'Negara Uji',
            'is_active' => true,
        ]);
        $actor = $this->createSuperAdminUser('kode.super.adm');

        $this->actingAs($actor, 'sanctum')
            ->putJson('/api/master/wilayah-adm/negara/'.$negara->id, [
                'kode' => 'YY',
                'nama' => 'Negara Uji',
            ])
            ->assertOk()
            ->assertJsonPath('data.kode', 'YY');

        $this->assertDatabaseHas('wilayah_adm_negara_m', [
            'id' => $negara->id,
            'kode' => 'YY',
        ]);
    }

    public function test_superadmin_can_update_wilayah_fung_kode(): void
    {
        $pusat = Pusat::query()->create([
            'kode' => 'P-OLD',
            'nama' => 'Pusat Uji',
            'is_active' => true,
        ]);
        $actor = $this->createSuperAdminUser('kode.super.fung');

        $this->actingAs($actor, 'sanctum')
            ->putJson('/api/master/wilayah-fung/pusat/'.$pusat->id, [
                'kode' => 'P-NEW',
                'nama' => 'Pusat Uji',
            ])
            ->assertOk()
            ->assertJsonPath('data.kode', 'P-NEW');

        $this->assertDatabaseHas('wilayah_fung_pusat_m', [
            'id' => $pusat->id,
            'kode' => 'P-NEW',
        ]);
    }

    public function test_non_superadmin_cannot_change_wilayah_kode(): void
    {
        $negara = AdmNegara::query()->create([
            'kode' => 'AA',
            'nama' => 'Negara Terkunci',
            'is_active' => true,
        ]);
        $pusat = Pusat::query()->create([
            'kode' => 'P-LOCK',
            'nama' => 'Pusat Terkunci',
            'is_active' => true,
        ]);
        $actor = $this->createAuthorizedUser(
            permissionSlugs: [
                'wilayah_adm_negara.update',
                'wilayah_fung_pusat.update',
            ],
            username: 'kode.operator',
            dapukanSlug: 'kode_operator',
        );
        $actor->dapukan()->update(['tingkat' => 'global']);
        $actor->unsetRelation('dapukan');

        $this->actingAs($actor, 'sanctum')
            ->putJson('/api/master/wilayah-adm/negara/'.$negara->id, [
                'kode' => 'BB',
                'nama' => 'Negara Terkunci',
            ])
            ->assertOk()
            ->assertJsonPath('data.kode', 'AA');

        $this->actingAs($actor, 'sanctum')
            ->putJson('/api/master/wilayah-fung/pusat/'.$pusat->id, [
                'kode' => 'P-HACK',
                'nama' => 'Pusat Terkunci',
            ])
            ->assertOk()
            ->assertJsonPath('data.kode', 'P-LOCK');
    }

    public function test_operator_with_matrix_kode_update_can_change_kode(): void
    {
        $negara = AdmNegara::query()->create([
            'kode' => 'CC',
            'nama' => 'Negara Matriks',
            'is_active' => true,
        ]);
        $actor = $this->createAuthorizedUser(
            permissionSlugs: [
                'wilayah_adm_negara.update',
                'wilayah_adm_negara.col.kode.update',
            ],
            username: 'kode.matriks',
            dapukanSlug: 'kode_matriks',
        );
        $actor->dapukan()->update(['tingkat' => 'global']);
        $actor->unsetRelation('dapukan');

        $this->actingAs($actor, 'sanctum')
            ->putJson('/api/master/wilayah-adm/negara/'.$negara->id, [
                'kode' => 'DD',
                'nama' => 'Negara Matriks',
            ])
            ->assertOk()
            ->assertJsonPath('data.kode', 'DD');
    }

    private function createSuperAdminUser(string $username): User
    {
        $dapukan = Dapukan::query()->firstOrCreate(
            ['slug' => 'superadmin'],
            [
                'nama' => 'Super Admin',
                'tingkat' => 'global',
                'urutan' => 1,
                'is_system' => true,
                'is_active' => true,
            ],
        );

        return User::createManaged([
            'name' => 'Super Admin Test',
            'username' => $username,
            'email' => $username.'@sijama.test',
            'password' => 'password',
            'dapukan_id' => $dapukan->id,
            'is_active' => true,
        ]);
    }
}
