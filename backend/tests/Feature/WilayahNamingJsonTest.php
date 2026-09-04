<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 14:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 14:40:00
 */

namespace Tests\Feature;

use App\Models\AdmKabupatenKota;
use App\Models\AdmNegara;
use App\Models\AdmProvinsi;
use App\Models\Daerah;
use App\Models\Desa;
use App\Models\Kelompok;
use App\Models\Pusat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesAuthorizedUser;
use Tests\TestCase;

class WilayahNamingJsonTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;

    public function test_provinsi_list_nests_wilayah_adm_negara(): void
    {
        $negara = AdmNegara::query()->create([
            'kode' => 'ID',
            'nama' => 'Indonesia',
            'iso3' => 'IDN',
            'singkatan' => 'IDN',
            'is_active' => true,
        ]);
        AdmProvinsi::query()->create([
            'wilayah_adm_negara_id' => $negara->id,
            'kode' => '32',
            'nama' => 'Jawa Barat',
            'singkatan' => 'JABAR',
            'is_active' => true,
        ]);

        $user = $this->createAuthorizedUser(
            permissionSlugs: ['wilayah_adm_provinsi.view'],
            username: 'adm.prov.json',
            dapukanSlug: 'adm_prov_json',
        );

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/master/wilayah-adm/provinsi?per_page=50')
            ->assertOk()
            ->assertJsonPath('data.items.0.wilayah_adm_negara.nama', 'Indonesia')
            ->assertJsonMissingPath('data.items.0.negara');
    }

    public function test_kabupaten_kota_list_nests_wilayah_adm_provinsi(): void
    {
        $negara = AdmNegara::query()->create([
            'kode' => 'ID',
            'nama' => 'Indonesia',
            'is_active' => true,
        ]);
        $provinsi = AdmProvinsi::query()->create([
            'wilayah_adm_negara_id' => $negara->id,
            'kode' => '32',
            'nama' => 'Jawa Barat',
            'is_active' => true,
        ]);
        AdmKabupatenKota::query()->create([
            'wilayah_adm_provinsi_id' => $provinsi->id,
            'kode' => '32.73',
            'nama' => 'Kota Bandung',
            'jenis' => 'kota',
            'is_active' => true,
        ]);

        $user = $this->createAuthorizedUser(
            permissionSlugs: ['wilayah_adm_kabupaten_kota.view'],
            username: 'adm.kab.json',
            dapukanSlug: 'adm_kab_json',
        );

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/master/wilayah-adm/kabupaten-kota?per_page=50')
            ->assertOk()
            ->assertJsonPath('data.items.0.wilayah_adm_provinsi.nama', 'Jawa Barat')
            ->assertJsonMissingPath('data.items.0.provinsi');
    }

    public function test_kelompok_options_nests_wilayah_fung_desa(): void
    {
        $kelompok = $this->makeKelompok();
        $user = $this->createAuthorizedUser(
            permissionSlugs: ['jamaah.view'],
            username: 'kelompok.opt.json',
            dapukanSlug: 'kelompok_opt_json',
        );
        $this->assignKelompokScope($user, $kelompok);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/jamaah/kelompok-options')
            ->assertOk()
            ->assertJsonPath('data.0.wilayah_fung_desa.nama', 'Desa JSON')
            ->assertJsonMissingPath('data.0.desa');
    }

    private function makeKelompok(): Kelompok
    {
        $pusat = Pusat::query()->create([
            'kode' => 'P-JSON',
            'nama' => 'Pusat JSON',
            'is_active' => true,
        ]);
        $daerah = Daerah::query()->create([
            'wilayah_fung_pusat_id' => $pusat->id,
            'kode' => 'D-JSON',
            'nama' => 'Daerah JSON',
            'is_active' => true,
        ]);
        $desa = Desa::query()->create([
            'wilayah_fung_daerah_id' => $daerah->id,
            'kode' => 'DES-JSON',
            'nama' => 'Desa JSON',
            'is_active' => true,
        ]);

        return Kelompok::query()->create([
            'wilayah_fung_desa_id' => $desa->id,
            'kode' => 'KEL-JSON',
            'nama' => 'Kelompok JSON',
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
}
