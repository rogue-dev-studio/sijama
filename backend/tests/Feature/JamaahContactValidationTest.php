<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:10:00
 */

namespace Tests\Feature;

use App\Models\Daerah;
use App\Models\Desa;
use App\Models\Jamaah;
use App\Models\Kelompok;
use App\Models\Pusat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesAuthorizedUser;
use Tests\Support\SeedsLookupM;
use Tests\TestCase;

class JamaahContactValidationTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;
    use SeedsLookupM;

    private function makeKelompok(): Kelompok
    {
        $pusat = Pusat::query()->create([
            'kode' => 'P-TEST',
            'nama' => 'Pusat Test',
            'is_active' => true,
        ]);
        $daerah = Daerah::query()->create([
            'wilayah_fung_pusat_id' => $pusat->id,
            'kode' => 'D-TEST',
            'nama' => 'Daerah Test',
            'is_active' => true,
        ]);
        $desa = Desa::query()->create([
            'wilayah_fung_daerah_id' => $daerah->id,
            'kode' => 'DES-TEST',
            'nama' => 'Desa Test',
            'is_active' => true,
        ]);

        return Kelompok::query()->create([
            'wilayah_fung_desa_id' => $desa->id,
            'kode' => 'KEL-TEST',
            'nama' => 'Kelompok Test',
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
    }

    public function test_jamaah_can_be_created_without_phone_and_email(): void
    {
        $this->seedLookupM();
        $kelompok = $this->makeKelompok();
        $user = $this->createAuthorizedUser(permissionSlugs: ['jamaah.create']);
        $this->assignKelompokScope($user, $kelompok);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/jamaah', [
            'nama' => 'Tanpa Kontak',
            'gender' => 'L',
            'status' => 'aktif',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('jamaah_r', [
            'nama' => 'Tanpa Kontak',
            'no_hp' => null,
            'email' => null,
        ]);
    }

    public function test_jamaah_phone_must_be_unique_when_filled(): void
    {
        $this->seedLookupM();
        $user = $this->createAuthorizedUser(permissionSlugs: ['jamaah.create']);
        Jamaah::query()->create([
            'nama' => 'Existing',
            'gender' => 'L',
            'no_hp' => '081111111111',
            'status' => 'aktif',
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/jamaah', [
            'nama' => 'Duplikat HP',
            'gender' => 'P',
            'no_hp' => '081111111111',
            'status' => 'aktif',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['no_hp']);
    }
}
