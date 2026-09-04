<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 14:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 14:20:00
 */

namespace Tests\Feature;

use App\Models\Dapukan;
use App\Models\HakAkses;
use App\Support\SuperAdminAccess;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RbacMatriksCatalogTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return list<string>
     */
    private function requiredSlugs(): array
    {
        return [
            'kategori_kegiatan.view',
            'kategori_kegiatan.create',
            'kategori_kegiatan.update',
            'kategori_kegiatan.delete',
            'kategori_kegiatan.btn.create.view',
            'kategori_kegiatan.col.nama.view',
            'jamaah.col.wilayah_fung_kelompok.view',
            'keluarga.col.wilayah_fung_kelompok.view',
            'laporan_jamaah.col.wilayah_fung_kelompok.view',
            'laporan_kehadiran.col.wilayah_fung_kelompok.view',
            'kegiatan.col.frekuensi.view',
            'kegiatan.col.pola.view',
            'kegiatan.col.cakupan.view',
            'kegiatan.col.effective_from.view',
            'kegiatan.col.is_active.view',
            'wilayah_fung_kelompok.col.singkatan.view',
            'wilayah_adm_provinsi.col.singkatan.view',
            'wilayah_adm_kabupaten_kota.col.singkatan.view',
            'wilayah_adm_kabupaten_kota.col.singkatan_kawasan_metropolitan.view',
            'wilayah_adm_kode_pos.col.wilayah.view',
            'wilayah_adm_kode_pos.col.wilayah_adm_negara.view',
            'wilayah_adm_negara.col.kode.update',
            'wilayah_fung_pusat.col.nama.update',
            'wilayah_fung_daerah.col.wilayah_fung_pusat.view',
            'wilayah_adm_provinsi.col.wilayah_adm_negara.update',
        ];
    }

    public function test_rbac_seeder_creates_ui_aligned_hak_akses_and_full_superadmin_grant(): void
    {
        $this->seed(RbacSeeder::class);

        $this->assertFalse(
            HakAkses::query()->where('slug', 'like', 'kategori_kegiatan_m.%')->exists(),
            'Prefix kategori_kegiatan_m tidak boleh tersisa di matriks.',
        );

        foreach ($this->requiredSlugs() as $slug) {
            $this->assertTrue(
                HakAkses::query()->where('slug', $slug)->exists(),
                "Hak akses {$slug} wajib ada di matriks.",
            );
        }

        $allSlugs = HakAkses::query()->orderBy('slug')->pluck('slug')->all();
        $grantCount = Dapukan::query()
            ->where('slug', SuperAdminAccess::DAPUKAN_SLUG)
            ->firstOrFail()
            ->hakAkses()
            ->count();

        $this->assertNotEmpty($allSlugs);
        $this->assertSame(count($allSlugs), $grantCount);
        $this->assertGreaterThanOrEqual(530, count($allSlugs));
    }
}
