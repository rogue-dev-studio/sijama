<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:29:10
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:29:10
 */

namespace Tests\Feature;

use App\Models\Jamaah;
use App\Models\Kegiatan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesAuthorizedUser;
use Tests\TestCase;

class AttendanceFlowTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;

    public function test_open_check_in_and_close_session_flow(): void
    {
        $user = $this->createAuthorizedUser(
            permissionSlugs: [
                'absensi.view',
                'absensi.create',
                'absensi.execute',
            ],
            username: 'absensi.ops',
            dapukanSlug: 'absensi_ops_global',
        );

        $user->dapukan()->update(['tingkat' => 'global']);
        $user->unsetRelation('dapukan');
        $user->load('dapukan');

        $kegiatan = Kegiatan::query()->create([
            'judul' => 'Kegiatan Uji Absensi',
            'jenis' => 'lainnya',
            'tanggal' => now()->toDateString(),
            'status' => 'terjadwal',
        ]);

        $jamaah = Jamaah::query()->create([
            'nik' => '1212121212121212',
            'nama' => 'Jamaah Absensi',
            'gender' => 'L',
            'rt' => '01',
            'rw' => '01',
            'no_hp' => '081234567890',
            'status' => 'aktif',
        ]);

        $open = $this->actingAs($user, 'sanctum')
            ->postJson('/api/attendance/sessions', [
                'type' => 'kegiatan',
                'ref_id' => $kegiatan->id,
                'title' => 'Sesi '.$kegiatan->judul,
            ]);

        $open->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'open');

        $sessionId = (int) $open->json('data.id');

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/attendance/sessions/'.$sessionId.'/check-in', [
                'jamaah_id' => $jamaah->id,
                'method' => 'manual',
            ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.jamaah_id', $jamaah->id);

        $jamaahFace = Jamaah::query()->create([
            'nik' => '1313131313131313',
            'nama' => 'Jamaah Face Check-in',
            'gender' => 'P',
            'rt' => '02',
            'rw' => '02',
            'no_hp' => '081234567891',
            'status' => 'aktif',
            'face_descriptor' => array_fill(0, 128, 0.2),
            'enrolled_at' => now(),
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/attendance/sessions/'.$sessionId.'/check-in', [
                'jamaah_id' => $jamaahFace->id,
                'method' => 'face',
                'matched_distance' => 0.38,
            ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.jamaah_id', $jamaahFace->id)
            ->assertJsonPath('data.method', 'face');

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/attendance/sessions/'.$sessionId.'/close')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'closed');

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/attendance/sessions/'.$sessionId.'/check-in', [
                'jamaah_id' => $jamaah->id,
                'method' => 'manual',
            ])
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }
}
