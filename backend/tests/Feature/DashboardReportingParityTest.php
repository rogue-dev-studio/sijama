<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 10:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:00:00
 */

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\Daerah;
use App\Models\Desa;
use App\Models\Jamaah;
use App\Models\Kelompok;
use App\Models\Pusat;
use App\Models\User;
use App\Services\ReportingViewService;
use App\Services\ScopeService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\Support\CreatesAuthorizedUser;
use Tests\TestCase;

class DashboardReportingParityTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;

    private function reportingOrSkip(): ReportingViewService
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            $this->markTestSkipped('Reporting MV tests require PostgreSQL.');
        }

        $service = app(ReportingViewService::class);
        if (! $service->isEnabled()) {
            $this->markTestSkipped('Reporting materialized views are not installed.');
        }

        return $service;
    }

    /**
     * @return array{user: User, kelompok: Kelompok, jamaah: Jamaah}
     */
    private function seedScopedJamaah(): array
    {
        $pusat = Pusat::query()->create([
            'kode' => 'P-DASH',
            'nama' => 'Pusat Dash',
            'is_active' => true,
        ]);
        $daerah = Daerah::query()->create([
            'wilayah_fung_pusat_id' => $pusat->id,
            'kode' => 'D-DASH',
            'nama' => 'Daerah Dash',
            'is_active' => true,
        ]);
        $desa = Desa::query()->create([
            'wilayah_fung_daerah_id' => $daerah->id,
            'kode' => 'DES-DASH',
            'nama' => 'Desa Dash',
            'is_active' => true,
        ]);
        $kelompok = Kelompok::query()->create([
            'wilayah_fung_desa_id' => $desa->id,
            'kode' => 'KEL-DASH',
            'nama' => 'Kelompok Dash',
            'is_active' => true,
        ]);
        $jamaah = Jamaah::query()->create([
            'wilayah_fung_kelompok_id' => $kelompok->id,
            'nik' => '5555666677778888',
            'nama' => 'Jamaah Dash',
            'gender' => 'L',
            'kategori_umur' => 'dewasa',
            'rt' => '01',
            'rw' => '01',
            'status' => 'aktif',
        ]);

        $user = $this->createAuthorizedUser(
            permissionSlugs: ['dashboard.view', 'dashboard.jamaah_kelompok.view'],
            username: 'dash.scope',
            dapukanSlug: 'dash_scope',
        );
        $user->updateAttributes([
            'wilayah_fung_kelompok_id' => $kelompok->id,
            'wilayah_fung_desa_id' => $desa->id,
            'wilayah_fung_daerah_id' => $daerah->id,
            'wilayah_fung_pusat_id' => $pusat->id,
        ]);
        $user->dapukan()->update(['tingkat' => 'kelompok']);
        $user->unsetRelation('dapukan');
        $user->load('dapukan');

        return compact('user', 'kelompok', 'jamaah');
    }

    public function test_reporting_refresh_command_succeeds_on_pgsql(): void
    {
        $reporting = $this->reportingOrSkip();
        ['user' => $user, 'jamaah' => $jamaah] = $this->seedScopedJamaah();

        Attendance::query()->create([
            'session_id' => AttendanceSession::query()->create([
                'type' => 'manual',
                'ref_id' => 1,
                'title' => 'Sesi Dash',
                'opened_by' => $user->id,
                'opened_at' => now(),
                'status' => 'open',
            ])->id,
            'jamaah_id' => $jamaah->id,
            'method' => 'manual',
            'recorded_by' => $user->id,
            'recorded_at' => now(),
        ]);

        $this->artisan('reporting:refresh-views')->assertSuccessful();

        $this->assertGreaterThanOrEqual(1, $reporting->absensiHariIni($user, Carbon::now()));
    }

    public function test_mv_jamaah_aktif_matches_legacy_count(): void
    {
        $reporting = $this->reportingOrSkip();
        ['user' => $user] = $this->seedScopedJamaah();

        $reporting->refresh();

        $scopeService = app(ScopeService::class);
        $legacyQuery = Jamaah::query()->where('status', 'aktif');
        $scopeService->applyJamaahScope($legacyQuery, $user);
        $legacyCount = $legacyQuery->count();

        $this->assertSame($legacyCount, $reporting->jamaahAktifCount($user));
    }

    public function test_mv_chart_jamaah_per_kelompok_matches_legacy(): void
    {
        $reporting = $this->reportingOrSkip();
        ['user' => $user, 'kelompok' => $kelompok] = $this->seedScopedJamaah();

        $reporting->refresh();

        $scopeService = app(ScopeService::class);
        $legacyQuery = Kelompok::query()
            ->withCount([
                'jamaah as jamaah_aktif_count' => function ($q) use ($user, $scopeService) {
                    $q->where('status', 'aktif');
                    $scopeService->applyJamaahScope($q, $user);
                },
            ])
            ->orderByDesc('jamaah_aktif_count')
            ->limit(8);
        $scopeService->applyKelompokScope($legacyQuery, $user);

        $legacy = $legacyQuery->get()
            ->filter(fn (Kelompok $row) => $row->jamaah_aktif_count > 0)
            ->map(fn (Kelompok $row) => [
                'label' => $row->nama,
                'value' => (int) $row->jamaah_aktif_count,
            ])
            ->values()
            ->all();

        $this->assertSame($legacy, $reporting->chartJamaahPerKelompok($user));
        $this->assertSame($kelompok->nama, $legacy[0]['label'] ?? null);
    }

    public function test_dashboard_api_returns_ok_when_mv_enabled(): void
    {
        $this->reportingOrSkip();
        ['user' => $user] = $this->seedScopedJamaah();

        app(ReportingViewService::class)->refresh();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'jamaah_aktif',
                    'absensi_hari_ini',
                    'chart_absensi_7_hari',
                ],
            ]);
    }
}
