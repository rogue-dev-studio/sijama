<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 18:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 18:30:00
 */

namespace Tests\Feature;

use App\Models\Daerah;
use App\Models\Kelompok;
use App\Models\Kegiatan;
use App\Models\KegiatanJadwalRutin;
use App\Models\Pusat;
use App\Services\KegiatanRutinGeneratorService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesAuthorizedUser;
use Tests\TestCase;

class KegiatanJadwalRutinTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;

    public function test_weekly_schedule_generates_kegiatan_instances(): void
    {
        [$daerah, $kelompok] = $this->seedWilayah();
        $actor = $this->createGlobalActor(
            permissionSlugs: ['kegiatan.view', 'kegiatan.create', 'kegiatan.update'],
            username: 'jadwal.admin',
        );

        $effectiveFrom = Carbon::parse('2026-09-01')->toDateString();

        $response = $this->actingAs($actor, 'sanctum')
            ->postJson('/api/kegiatan-jadwal-rutin', [
                'judul' => 'Pengajian Rutin Ahad',
                'frekuensi' => 'mingguan',
                'day_of_week' => 7,
                'scope_level' => 'kelompok',
                'wilayah_fung_daerah_id' => $daerah->id,
                'wilayah_fung_desa_id' => $kelompok->wilayah_fung_desa_id,
                'wilayah_fung_kelompok_id' => $kelompok->id,
                'effective_from' => $effectiveFrom,
                'generate_horizon_days' => 30,
            ]);

        $response->assertCreated()->assertJsonPath('data.judul', 'Pengajian Rutin Ahad');

        $jadwalId = (int) $response->json('data.id');
        $this->assertGreaterThan(0, Kegiatan::query()->where('jadwal_rutin_id', $jadwalId)->count());
    }

    public function test_deactivate_schedule_stops_being_active(): void
    {
        [$daerah, $kelompok] = $this->seedWilayah();
        $actor = $this->createGlobalActor(
            permissionSlugs: ['kegiatan.view', 'kegiatan.create', 'kegiatan.update'],
            username: 'jadwal.admin2',
        );

        $create = $this->actingAs($actor, 'sanctum')
            ->postJson('/api/kegiatan-jadwal-rutin', [
                'judul' => 'Kegiatan Bulanan',
                'frekuensi' => 'bulanan',
                'day_of_month' => 10,
                'scope_level' => 'daerah',
                'wilayah_fung_daerah_id' => $daerah->id,
                'effective_from' => '2026-09-01',
            ])
            ->assertCreated();

        $jadwalId = (int) $create->json('data.id');

        $this->actingAs($actor, 'sanctum')
            ->postJson('/api/kegiatan-jadwal-rutin/'.$jadwalId.'/deactivate')
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('kegiatan_jadwal_rutin_t', [
            'id' => $jadwalId,
            'is_active' => false,
        ]);
    }

    public function test_generator_command_processes_active_schedules(): void
    {
        [$daerah, $kelompok] = $this->seedWilayah();

        $jadwal = KegiatanJadwalRutin::query()->create([
            'judul' => 'Test Mingguan',
            'frekuensi' => KegiatanJadwalRutin::FREKUENSI_MINGGUAN,
            'day_of_week' => Carbon::now()->isoWeekday(),
            'scope_level' => KegiatanJadwalRutin::SCOPE_KELOMPOK,
            'wilayah_fung_daerah_id' => $daerah->id,
            'wilayah_fung_desa_id' => $kelompok->wilayah_fung_desa_id,
            'wilayah_fung_kelompok_id' => $kelompok->id,
            'effective_from' => now()->toDateString(),
            'generate_horizon_days' => 14,
            'is_active' => true,
        ]);

        $created = app(KegiatanRutinGeneratorService::class)->syncSchedule($jadwal);

        $this->assertGreaterThanOrEqual(1, $created);
        $this->assertTrue(
            Kegiatan::query()->where('jadwal_rutin_id', $jadwal->id)->exists()
        );
    }

    /** @return array{0: Daerah, 1: Kelompok} */
    private function seedWilayah(): array
    {
        $pusat = Pusat::query()->create([
            'kode' => 'pusat-jadwal',
            'nama' => 'Pusat Jadwal',
            'is_active' => true,
        ]);

        $daerah = Daerah::query()->create([
            'wilayah_fung_pusat_id' => $pusat->id,
            'kode' => '01',
            'nama' => 'Daerah Jadwal',
            'is_active' => true,
        ]);

        $desa = \App\Models\Desa::query()->create([
            'wilayah_fung_daerah_id' => $daerah->id,
            'kode' => '01',
            'nama' => 'Desa Jadwal',
            'is_active' => true,
        ]);

        $kelompok = Kelompok::query()->create([
            'wilayah_fung_desa_id' => $desa->id,
            'nama' => 'Kelompok Jadwal',
            'is_active' => true,
        ]);

        return [$daerah, $kelompok];
    }

    /**
     * @param  list<string>  $permissionSlugs
     */
    private function createGlobalActor(array $permissionSlugs, string $username): \App\Models\User
    {
        $dapukan = \App\Models\Dapukan::query()->create([
            'slug' => 'global_jadwal_'.$username,
            'nama' => 'Global Jadwal',
            'tingkat' => 'global',
            'urutan' => 98,
            'is_system' => false,
            'is_active' => true,
        ]);

        if ($permissionSlugs !== []) {
            $menu = \App\Models\Menu::query()->create([
                'slug' => 'test-menu-'.$username,
                'nama' => 'Test Menu',
                'path' => '/test',
                'icon' => 'box',
                'urutan' => 1,
                'is_active' => true,
            ]);
            $fitur = \App\Models\Fitur::query()->create([
                'menu_id' => $menu->id,
                'slug' => 'test-fitur-'.$username,
                'nama' => 'Test Fitur',
                'is_active' => true,
            ]);
            $hakIds = [];
            foreach ($permissionSlugs as $slug) {
                $hak = \App\Models\HakAkses::query()->create([
                    'fitur_id' => $fitur->id,
                    'slug' => $slug,
                    'nama' => $slug,
                    'aksi' => str_contains($slug, '.') ? explode('.', $slug)[1] : 'view',
                ]);
                $hakIds[] = $hak->id;
            }
            $dapukan->hakAkses()->sync($hakIds);
        }

        return \App\Models\User::createManaged([
            'name' => 'Global Actor',
            'username' => $username,
            'email' => $username.'@sijama.test',
            'password' => 'password',
            'dapukan_id' => $dapukan->id,
            'is_active' => true,
        ]);
    }
}
