<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 10:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:00:00
 */

namespace Tests\Feature;

use App\Models\Daerah;
use App\Models\Desa;
use App\Models\Kelompok;
use App\Models\Pusat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesAuthorizedUser;
use Tests\Support\SeedsLookupM;
use Tests\TestCase;

class JamaahCreateFlowTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;
    use SeedsLookupM;

    private function makeKelompok(): Kelompok
    {
        $pusat = Pusat::query()->create([
            'kode' => 'P-E2E',
            'nama' => 'Pusat E2E',
            'is_active' => true,
        ]);
        $daerah = Daerah::query()->create([
            'wilayah_fung_pusat_id' => $pusat->id,
            'kode' => 'D-E2E',
            'nama' => 'Daerah E2E',
            'is_active' => true,
        ]);
        $desa = Desa::query()->create([
            'wilayah_fung_daerah_id' => $daerah->id,
            'kode' => 'DES-E2E',
            'nama' => 'Desa E2E',
            'is_active' => true,
        ]);

        return Kelompok::query()->create([
            'wilayah_fung_desa_id' => $desa->id,
            'kode' => 'KEL-E2E',
            'nama' => 'Kelompok E2E',
            'is_active' => true,
        ]);
    }

    private function assignKelompokScope(User $user, Kelompok $kelompok): void
    {
        $kelompok->loadMissing('wilayahFungDesa.wilayahFungDaerah');
        $user->updateAttributes([
            'wilayah_fung_kelompok_id' => $kelompok->id,
            'wilayah_fung_desa_id' => $kelompok->wilayah_fung_desa_id,
            'wilayah_fung_daerah_id' => $kelompok->wilayahFungDesa->wilayah_fung_daerah_id,
            'wilayah_fung_pusat_id' => $kelompok->wilayahFungDesa->wilayahFungDaerah->wilayah_fung_pusat_id,
        ]);
        $user->dapukan()->update(['tingkat' => 'kelompok']);
        $user->unsetRelation('dapukan');
        $user->load('dapukan');
    }

    public function test_create_jamaah_happy_path_visible_in_scoped_list(): void
    {
        $this->seedLookupM();
        $kelompok = $this->makeKelompok();
        $user = $this->createAuthorizedUser(
            permissionSlugs: ['jamaah.create', 'jamaah.view'],
            username: 'jamaah.e2e',
            dapukanSlug: 'jamaah_e2e',
        );
        $this->assignKelompokScope($user, $kelompok);

        $create = $this->actingAs($user, 'sanctum')->postJson('/api/jamaah', [
            'nama' => 'Jamaah Baru E2E',
            'gender' => 'L',
            'nik' => '1234567890123456',
            'status' => 'aktif',
            'wilayah_fung_kelompok_id' => $kelompok->id,
            'rt' => '01',
            'rw' => '02',
        ]);

        $create->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nama', 'Jamaah Baru E2E');

        $createdId = (int) $create->json('data.id');

        $list = $this->actingAs($user, 'sanctum')->getJson('/api/jamaah?q=Jamaah+Baru+E2E');

        $list->assertOk()
            ->assertJsonPath('success', true);

        $ids = collect($list->json('data.items'))->pluck('id')->all();
        $this->assertContains($createdId, $ids);

        $this->assertDatabaseHas('jamaah_r', [
            'id' => $createdId,
            'nama' => 'Jamaah Baru E2E',
            'wilayah_fung_kelompok_id' => $kelompok->id,
            'nik' => '1234567890123456',
        ]);
    }
}
