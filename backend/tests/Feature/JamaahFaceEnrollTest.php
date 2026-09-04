<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 10:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:45:00
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

class JamaahFaceEnrollTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;
    use SeedsLookupM;

    private function makeKelompok(): Kelompok
    {
        $pusat = Pusat::query()->create([
            'kode' => 'P-FACE',
            'nama' => 'Pusat Face',
            'is_active' => true,
        ]);
        $daerah = Daerah::query()->create([
            'wilayah_fung_pusat_id' => $pusat->id,
            'kode' => 'D-FACE',
            'nama' => 'Daerah Face',
            'is_active' => true,
        ]);
        $desa = Desa::query()->create([
            'wilayah_fung_daerah_id' => $daerah->id,
            'kode' => 'DES-FACE',
            'nama' => 'Desa Face',
            'is_active' => true,
        ]);

        return Kelompok::query()->create([
            'wilayah_fung_desa_id' => $desa->id,
            'kode' => 'KEL-FACE',
            'nama' => 'Kelompok Face',
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

    public function test_enroll_face_descriptor_visible_in_scoped_list(): void
    {
        $this->seedLookupM();
        $kelompok = $this->makeKelompok();
        $user = $this->createAuthorizedUser(
            permissionSlugs: ['jamaah.create', 'jamaah.view', 'jamaah.enroll_face'],
            username: 'face.enroll',
            dapukanSlug: 'face_enroll',
        );
        $this->assignKelompokScope($user, $kelompok);

        $create = $this->actingAs($user, 'sanctum')->postJson('/api/jamaah', [
            'nama' => 'Jamaah Face Test',
            'gender' => 'L',
            'nik' => '9876543210987654',
            'status' => 'aktif',
            'wilayah_fung_kelompok_id' => $kelompok->id,
        ]);

        $create->assertCreated();
        $jamaahId = (int) $create->json('data.id');

        $descriptor = array_fill(0, 128, 0.125);

        $enroll = $this->actingAs($user, 'sanctum')->postJson("/api/jamaah/{$jamaahId}/face", [
            'face_descriptor' => $descriptor,
        ]);

        $enroll->assertOk()
            ->assertJsonPath('success', true);

        $show = $this->actingAs($user, 'sanctum')->getJson("/api/jamaah/{$jamaahId}");

        $show->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.face_enrolled', true);

        $list = $this->actingAs($user, 'sanctum')->getJson('/api/jamaah?face=enrolled&q=Jamaah+Face+Test');

        $list->assertOk()
            ->assertJsonPath('success', true);

        $items = collect($list->json('data.items'));
        $this->assertTrue($items->contains(fn (array $row): bool => (int) ($row['id'] ?? 0) === $jamaahId));
    }
}
