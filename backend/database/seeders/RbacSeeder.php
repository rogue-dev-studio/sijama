<?php

namespace Database\Seeders;

use App\Models\Dapukan;
use App\Models\Fitur;
use App\Models\HakAkses;
use App\Models\Menu;
use App\Models\User;
use App\Services\RbacMenuService;
use App\Support\SuperAdminAccess;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        $dapukan = $this->seedDapukan();
        $this->purgeObsoleteDapukan($dapukan);
        [$menus, $fiturs, $permissions] = SuperAdminAccess::withoutAutoProvision(function () {
            $menus = $this->seedMenus();
            $fiturs = $this->seedFiturs($menus);
            $permissions = HakAkses::withoutEvents(fn () => $this->seedHakAkses($fiturs));

            return [$menus, $fiturs, $permissions];
        });
        HakAkses::whereIn('slug', ['konfig.create', 'konfig.delete'])->delete();
        $this->purgeObsoletePekerjaanMaster();
        $this->purgeObsoleteHakAkses(array_keys($permissions));
        $this->assignPermissions($dapukan, $permissions);
        SuperAdminAccess::grantAll();
        SuperAdminAccess::ensureReservedUser();
        RbacMenuService::forgetFullMenuTreeCache();
    }

    private function purgeObsoletePekerjaanMaster(): void
    {
        Menu::where('slug', 'master-pekerjaan')->update(['is_active' => false]);
        Fitur::where('slug', 'master-pekerjaan')->update(['is_active' => false]);

        $obsoleteIds = HakAkses::query()
            ->where(function ($query) {
                $query->where('slug', 'like', 'pekerjaan.%')
                    ->orWhereHas('fitur', fn ($fitur) => $fitur->where('slug', 'master-pekerjaan'));
            })
            ->pluck('id');

        if ($obsoleteIds->isEmpty()) {
            return;
        }

        DB::table('dapukan_hak_akses_mp')->whereIn('hak_akses_id', $obsoleteIds)->delete();
        HakAkses::whereIn('id', $obsoleteIds)->delete();
    }

    /**
     * @param  list<string>  $keepSlugs
     */
    private function purgeObsoleteHakAkses(array $keepSlugs): void
    {
        $obsoleteIds = HakAkses::query()
            ->where(function ($query) {
                $query->where('slug', 'like', 'kategori_kegiatan_m.%')
                    ->orWhere('slug', 'like', 'pengajian.%')
                    ->orWhere('slug', 'like', 'laporan_pengajian.%')
                    ->orWhereIn('slug', [
                        'jamaah.col.kelompok.view',
                        'keluarga.col.kelompok.view',
                        'laporan_jamaah.col.kelompok.view',
                        'laporan_kehadiran.col.kelompok.view',
                        'wilayah_adm_kode_pos.col.nama.view',
                        'wilayah_adm_kode_pos.col.negara.view',
                    ]);
            })
            ->whereNotIn('slug', $keepSlugs)
            ->pluck('id');

        if ($obsoleteIds->isNotEmpty()) {
            DB::table('dapukan_hak_akses_mp')->whereIn('hak_akses_id', $obsoleteIds)->delete();
            HakAkses::whereIn('id', $obsoleteIds)->delete();
        }

        Fitur::query()
            ->where(function ($query) {
                $query->where('slug', 'like', 'kategori_kegiatan_m-%')
                    ->orWhere('slug', 'like', 'pengajian-%')
                    ->orWhere('slug', 'like', 'laporan_pengajian-%')
                    ->orWhereIn('slug', [
                        'jamaah-col-kelompok',
                        'keluarga-col-kelompok',
                        'laporan_jamaah-col-kelompok',
                        'laporan_kehadiran-col-kelompok',
                        'wilayah_adm_kode_pos-col-nama',
                        'wilayah_adm_kode_pos-col-negara',
                    ]);
            })
            ->whereDoesntHave('hakAkses')
            ->delete();
    }

    private function purgeObsoleteDapukan(array $active): void
    {
        $activeSlugs = array_keys($active);
        $remap = [
            'admin' => 'admin_kelompok',
            '5s' => '4s_kelompok',
            '5s_pusat' => '4s_daerah',
            '5s_daerah' => '4s_daerah',
            '5s_desa' => '4s_desa',
            '5s_kelompok' => '4s_kelompok',
            'pnkb' => 'pnkb_daerah',
            'pjp_ppg_pusat' => 'pjp_daerah',
            'pjp_ppg_daerah' => 'pjp_daerah',
            'pjp_ppg_desa' => 'pjp_desa',
            'pjp_ppg_kelompok' => 'pjp_kelompok',
            'bk_ppg' => 'bk_daerah',
        ];

        Dapukan::query()
            ->whereNotIn('slug', $activeSlugs)
            ->orderBy('id')
            ->each(function (Dapukan $legacy) use ($remap, $active) {
                $replacementSlug = $remap[$legacy->slug] ?? null;
                $replacement = $replacementSlug ? ($active[$replacementSlug] ?? null) : null;

                if ($replacement) {
                    User::where('dapukan_id', $legacy->id)->update(['dapukan_id' => $replacement->id]);

                    if (Schema::hasTable('jamaah_dapukan_mp')) {
                        $jamaahIds = DB::table('jamaah_dapukan_mp')
                            ->where('dapukan_id', $legacy->id)
                            ->pluck('jamaah_id');

                        foreach ($jamaahIds as $jamaahId) {
                            $exists = DB::table('jamaah_dapukan_mp')
                                ->where('jamaah_id', $jamaahId)
                                ->where('dapukan_id', $replacement->id)
                                ->exists();

                            if ($exists) {
                                DB::table('jamaah_dapukan_mp')
                                    ->where('jamaah_id', $jamaahId)
                                    ->where('dapukan_id', $legacy->id)
                                    ->delete();
                            } else {
                                DB::table('jamaah_dapukan_mp')
                                    ->where('jamaah_id', $jamaahId)
                                    ->where('dapukan_id', $legacy->id)
                                    ->update(['dapukan_id' => $replacement->id]);
                            }
                        }
                    }
                } else {
                    User::where('dapukan_id', $legacy->id)->update(['dapukan_id' => null]);
                    if (Schema::hasTable('jamaah_dapukan_mp')) {
                        DB::table('jamaah_dapukan_mp')->where('dapukan_id', $legacy->id)->delete();
                    }
                }

                $legacy->hakAkses()->detach();
                $legacy->delete();
            });
    }

    private function seedDapukan(): array
    {
        $definitions = [
            ['slug' => 'superadmin', 'nama' => 'Super Admin', 'tingkat' => 'global', 'urutan' => 1],
            ['slug' => 'admin_pusat', 'nama' => 'Admin Pusat', 'tingkat' => 'pusat', 'urutan' => 2],
            ['slug' => 'admin_daerah', 'nama' => 'Admin Daerah', 'tingkat' => 'daerah', 'urutan' => 3],
            ['slug' => 'admin_desa', 'nama' => 'Admin Desa', 'tingkat' => 'desa', 'urutan' => 4],
            ['slug' => 'admin_kelompok', 'nama' => 'Admin Kelompok', 'tingkat' => 'kelompok', 'urutan' => 5],

            ['slug' => 'pnkb_daerah', 'nama' => 'PNKB Daerah', 'tingkat' => 'daerah', 'urutan' => 10, 'deskripsi' => 'Tim pernikahan daerah'],
            ['slug' => 'pnkb_desa', 'nama' => 'PNKB Desa', 'tingkat' => 'desa', 'urutan' => 11, 'deskripsi' => 'Tim pernikahan desa'],
            ['slug' => 'pnkb_kelompok', 'nama' => 'PNKB Kelompok', 'tingkat' => 'kelompok', 'urutan' => 12, 'deskripsi' => 'Tim pernikahan kelompok'],

            ['slug' => '4s_daerah', 'nama' => '4S Daerah', 'tingkat' => 'daerah', 'urutan' => 20],
            ['slug' => '4s_desa', 'nama' => '4S Desa', 'tingkat' => 'desa', 'urutan' => 21],
            ['slug' => '4s_kelompok', 'nama' => '4S Kelompok', 'tingkat' => 'kelompok', 'urutan' => 22],

            ['slug' => 'jamaah_kelompok', 'nama' => 'Jamaah Kelompok', 'tingkat' => 'kelompok', 'urutan' => 30],

            ['slug' => 'ku_daerah', 'nama' => 'KU Daerah', 'tingkat' => 'daerah', 'urutan' => 40, 'deskripsi' => 'Keuangan daerah'],
            ['slug' => 'ku_desa', 'nama' => 'KU Desa', 'tingkat' => 'desa', 'urutan' => 41, 'deskripsi' => 'Keuangan desa'],
            ['slug' => 'ku_kelompok', 'nama' => 'KU Kelompok', 'tingkat' => 'kelompok', 'urutan' => 42, 'deskripsi' => 'Keuangan kelompok'],

            ['slug' => 'kmm_daerah', 'nama' => 'KMM Daerah', 'tingkat' => 'daerah', 'urutan' => 50, 'deskripsi' => 'Ketua muda-mudi daerah'],
            ['slug' => 'kmm_desa', 'nama' => 'KMM Desa', 'tingkat' => 'desa', 'urutan' => 51, 'deskripsi' => 'Ketua muda-mudi desa'],
            ['slug' => 'kmm_kelompok', 'nama' => 'KMM Kelompok', 'tingkat' => 'kelompok', 'urutan' => 52, 'deskripsi' => 'Ketua muda-mudi kelompok'],

            ['slug' => 'pjp_daerah', 'nama' => 'PJP Daerah', 'tingkat' => 'daerah', 'urutan' => 60],
            ['slug' => 'pjp_desa', 'nama' => 'PJP Desa', 'tingkat' => 'desa', 'urutan' => 61],
            ['slug' => 'pjp_kelompok', 'nama' => 'PJP Kelompok', 'tingkat' => 'kelompok', 'urutan' => 62],

            ['slug' => 'bk_daerah', 'nama' => 'BK Daerah', 'tingkat' => 'daerah', 'urutan' => 70],
            ['slug' => 'bk_desa', 'nama' => 'BK Desa', 'tingkat' => 'desa', 'urutan' => 71],
            ['slug' => 'bk_kelompok', 'nama' => 'BK Kelompok', 'tingkat' => 'kelompok', 'urutan' => 72],

            ['slug' => 'keputrian_daerah', 'nama' => 'Keputrian Daerah', 'tingkat' => 'daerah', 'urutan' => 80],
            ['slug' => 'keputrian_desa', 'nama' => 'Keputrian Desa', 'tingkat' => 'desa', 'urutan' => 81],
            ['slug' => 'keputrian_kelompok', 'nama' => 'Keputrian Kelompok', 'tingkat' => 'kelompok', 'urutan' => 82],

            ['slug' => 'mubaligh_daerah', 'nama' => 'Mubaligh Daerah', 'tingkat' => 'daerah', 'urutan' => 90],
            ['slug' => 'mubaligh_desa', 'nama' => 'Mubaligh Desa', 'tingkat' => 'desa', 'urutan' => 91],
            ['slug' => 'mubaligh_kelompok', 'nama' => 'Mubaligh Kelompok', 'tingkat' => 'kelompok', 'urutan' => 92],

            ['slug' => 'faroid_daerah', 'nama' => 'Faroid Daerah', 'tingkat' => 'daerah', 'urutan' => 100],
            ['slug' => 'faroid_desa', 'nama' => 'Faroid Desa', 'tingkat' => 'desa', 'urutan' => 101],
            ['slug' => 'faroid_kelompok', 'nama' => 'Faroid Kelompok', 'tingkat' => 'kelompok', 'urutan' => 102],

            ['slug' => 'kematian_daerah', 'nama' => 'Kematian Daerah', 'tingkat' => 'daerah', 'urutan' => 110],
            ['slug' => 'kematian_desa', 'nama' => 'Kematian Desa', 'tingkat' => 'desa', 'urutan' => 111],
            ['slug' => 'kematian_kelompok', 'nama' => 'Kematian Kelompok', 'tingkat' => 'kelompok', 'urutan' => 112],
        ];

        $result = [];

        foreach ($definitions as $definition) {
            $result[$definition['slug']] = Dapukan::updateOrCreate(
                ['slug' => $definition['slug']],
                [
                    'nama' => $definition['nama'],
                    'deskripsi' => $definition['deskripsi'] ?? null,
                    'tingkat' => $definition['tingkat'],
                    'urutan' => $definition['urutan'],
                    'is_system' => true,
                    'is_active' => true,
                ]
            );
        }

        return $result;
    }

    private function seedMenus(): array
    {
        $definitions = [
            ['slug' => 'informasi', 'nama' => 'Informasi', 'path' => null, 'icon' => 'info', 'urutan' => 1, 'parent' => null],
            ['slug' => 'laporan', 'nama' => 'Laporan', 'path' => null, 'icon' => 'file-text', 'urutan' => 2, 'parent' => null],
            ['slug' => 'laporan-kehadiran', 'nama' => 'Kehadiran', 'path' => '/laporan/kehadiran', 'icon' => 'clipboard-check', 'urutan' => 1, 'parent' => 'laporan'],
            ['slug' => 'laporan-jamaah', 'nama' => 'Jamaah', 'path' => '/laporan/jamaah', 'icon' => 'users', 'urutan' => 2, 'parent' => 'laporan'],
            ['slug' => 'laporan-kegiatan', 'nama' => 'Kegiatan', 'path' => '/laporan/kegiatan', 'icon' => 'calendar', 'urutan' => 3, 'parent' => 'laporan'],

            ['slug' => 'transaksi', 'nama' => 'Transaksi', 'path' => null, 'icon' => 'arrow-left-right', 'urutan' => 3, 'parent' => null],
            ['slug' => 'master', 'nama' => 'Master', 'path' => null, 'icon' => 'database', 'urutan' => 4, 'parent' => null],
            ['slug' => 'aplikasi', 'nama' => 'Aplikasi', 'path' => null, 'icon' => 'settings', 'urutan' => 5, 'parent' => null],

            ['slug' => 'dashboard', 'nama' => 'Dashboard', 'path' => '/', 'icon' => 'layout-dashboard', 'urutan' => 1, 'parent' => 'informasi'],
            ['slug' => 'kehadiran', 'nama' => 'Kehadiran', 'path' => '/kehadiran', 'icon' => 'clipboard-check', 'urutan' => 2, 'parent' => 'informasi'],
            ['slug' => 'kategori-umur', 'nama' => 'Kategori Umur', 'path' => '/kategori-umur', 'icon' => 'users', 'urutan' => 3, 'parent' => 'informasi'],
            ['slug' => 'kalender', 'nama' => 'Kalender', 'path' => '/kalender', 'icon' => 'calendar', 'urutan' => 4, 'parent' => 'informasi'],

            ['slug' => 'kegiatan', 'nama' => 'Kegiatan', 'path' => '/kegiatan', 'icon' => 'calendar', 'urutan' => 1, 'parent' => 'transaksi'],
            ['slug' => 'kegiatan-jadwal-rutin', 'nama' => 'Jadwal Rutin Kegiatan', 'path' => '/kegiatan/jadwal-rutin', 'icon' => 'calendar-clock', 'urutan' => 2, 'parent' => 'transaksi'],
            ['slug' => 'absensi', 'nama' => 'Absensi', 'path' => '/absensi', 'icon' => 'scan-face', 'urutan' => 3, 'parent' => 'transaksi'],

            ['slug' => 'jamaah', 'nama' => 'Jamaah', 'path' => '/jamaah', 'icon' => 'users', 'urutan' => 1, 'parent' => 'master'],
            ['slug' => 'keluarga', 'nama' => 'Keluarga', 'path' => '/keluarga', 'icon' => 'home', 'urutan' => 2, 'parent' => 'master'],
            ['slug' => 'master-lokasi', 'nama' => 'Lokasi', 'path' => '/master/lokasi', 'icon' => 'map-pin', 'urutan' => 3, 'parent' => 'master'],
            ['slug' => 'master-pemateri', 'nama' => 'Pemateri', 'path' => '/master/pemateri', 'icon' => 'users', 'urutan' => 4, 'parent' => 'master'],
            ['slug' => 'master-materi', 'nama' => 'Materi', 'path' => '/master/materi', 'icon' => 'book-open', 'urutan' => 5, 'parent' => 'master'],
            ['slug' => 'master-kategori-kegiatan', 'nama' => 'Kategori Kegiatan', 'path' => '/master/kategori-kegiatan', 'icon' => 'calendar', 'urutan' => 6, 'parent' => 'master'],
            ['slug' => 'master-lookup', 'nama' => 'Lookup', 'path' => '/master/lookup', 'icon' => 'list', 'urutan' => 7, 'parent' => 'master'],
            ['slug' => 'wilayah', 'nama' => 'Wilayah Fungsional', 'path' => null, 'icon' => 'map', 'urutan' => 8, 'parent' => 'master'],
            ['slug' => 'master-wilayah-fung-pusat', 'nama' => 'Pusat', 'path' => '/master/wilayah-fung/pusat', 'icon' => 'building-2', 'urutan' => 1, 'parent' => 'wilayah'],
            ['slug' => 'master-wilayah-fung-daerah', 'nama' => 'Daerah', 'path' => '/master/wilayah-fung/daerah', 'icon' => 'map', 'urutan' => 2, 'parent' => 'wilayah'],
            ['slug' => 'master-wilayah-fung-desa', 'nama' => 'Desa', 'path' => '/master/wilayah-fung/desa', 'icon' => 'map-pin', 'urutan' => 3, 'parent' => 'wilayah'],
            ['slug' => 'master-wilayah-fung-kelompok', 'nama' => 'Kelompok', 'path' => '/master/wilayah-fung/kelompok', 'icon' => 'users-round', 'urutan' => 4, 'parent' => 'wilayah'],
            ['slug' => 'master-wilayah-fung-sub-kelompok', 'nama' => 'Sub Kelompok', 'path' => '/master/wilayah-fung/sub-kelompok', 'icon' => 'users', 'urutan' => 5, 'parent' => 'wilayah'],
            ['slug' => 'wilayah-adm', 'nama' => 'Wilayah Administrasi', 'path' => null, 'icon' => 'globe', 'urutan' => 9, 'parent' => 'master'],
            ['slug' => 'master-wilayah-adm-negara', 'nama' => 'Negara', 'path' => '/master/wilayah-adm/negara', 'icon' => 'flag', 'urutan' => 1, 'parent' => 'wilayah-adm'],
            ['slug' => 'master-wilayah-adm-provinsi', 'nama' => 'Provinsi', 'path' => '/master/wilayah-adm/provinsi', 'icon' => 'map', 'urutan' => 2, 'parent' => 'wilayah-adm'],
            ['slug' => 'master-wilayah-adm-kabupaten-kota', 'nama' => 'Kabupaten/Kota', 'path' => '/master/wilayah-adm/kabupaten-kota', 'icon' => 'building', 'urutan' => 3, 'parent' => 'wilayah-adm'],
            ['slug' => 'master-wilayah-adm-kecamatan', 'nama' => 'Kecamatan', 'path' => '/master/wilayah-adm/kecamatan', 'icon' => 'map-pin', 'urutan' => 4, 'parent' => 'wilayah-adm'],
            ['slug' => 'master-wilayah-adm-desa', 'nama' => 'Desa/Kelurahan', 'path' => '/master/wilayah-adm/desa', 'icon' => 'home', 'urutan' => 5, 'parent' => 'wilayah-adm'],
            ['slug' => 'master-wilayah-adm-kode-pos', 'nama' => 'Kode Pos', 'path' => '/master/wilayah-adm/kode-pos', 'icon' => 'mail', 'urutan' => 6, 'parent' => 'wilayah-adm'],
            ['slug' => 'master-dapukan', 'nama' => 'Dapukan', 'path' => '/master/dapukan', 'icon' => 'shield', 'urutan' => 10, 'parent' => 'master'],
            ['slug' => 'master-menu', 'nama' => 'Menu', 'path' => '/master/menu', 'icon' => 'menu', 'urutan' => 11, 'parent' => 'master'],
            ['slug' => 'master-fitur', 'nama' => 'Fitur', 'path' => '/master/fitur', 'icon' => 'puzzle', 'urutan' => 12, 'parent' => 'master'],
            ['slug' => 'master-hak-akses', 'nama' => 'Hak Akses', 'path' => '/master/hak-akses', 'icon' => 'key', 'urutan' => 13, 'parent' => 'master'],
            ['slug' => 'master-matriks', 'nama' => 'Matriks Akses', 'path' => '/master/matriks', 'icon' => 'grid-3x3', 'urutan' => 14, 'parent' => 'master'],
            ['slug' => 'master-users', 'nama' => 'Pengguna', 'path' => '/master/users', 'icon' => 'user-cog', 'urutan' => 15, 'parent' => 'master'],

            ['slug' => 'aplikasi-konfig', 'nama' => 'Konfigurasi Sistem', 'path' => '/aplikasi/konfig', 'icon' => 'settings', 'urutan' => 1, 'parent' => 'aplikasi'],
            ['slug' => 'aplikasi-konfig-dokumen', 'nama' => 'Konfigurasi Dokumen', 'path' => '/aplikasi/konfig-dokumen', 'icon' => 'file-text', 'urutan' => 2, 'parent' => 'aplikasi'],
            ['slug' => 'aplikasi-audit', 'nama' => 'Audit', 'path' => null, 'icon' => 'shield', 'urutan' => 3, 'parent' => 'aplikasi'],
            ['slug' => 'aplikasi-audit-login', 'nama' => 'Audit Login', 'path' => '/aplikasi/audit/login', 'icon' => 'log-in', 'urutan' => 1, 'parent' => 'aplikasi-audit'],
            ['slug' => 'aplikasi-audit-akses', 'nama' => 'Audit Akses', 'path' => '/aplikasi/audit/akses', 'icon' => 'key', 'urutan' => 2, 'parent' => 'aplikasi-audit'],
            ['slug' => 'aplikasi-audit-konfig', 'nama' => 'Audit Konfigurasi', 'path' => '/aplikasi/audit/konfig', 'icon' => 'settings', 'urutan' => 3, 'parent' => 'aplikasi-audit'],
            ['slug' => 'aplikasi-audit-jamaah', 'nama' => 'Audit Jamaah', 'path' => '/aplikasi/audit/jamaah', 'icon' => 'users', 'urutan' => 4, 'parent' => 'aplikasi-audit'],
            ['slug' => 'aplikasi-log', 'nama' => 'Log', 'path' => null, 'icon' => 'scroll-text', 'urutan' => 4, 'parent' => 'aplikasi'],
            ['slug' => 'aplikasi-log-error', 'nama' => 'Error Aplikasi', 'path' => '/aplikasi/log/error', 'icon' => 'alert-triangle', 'urutan' => 1, 'parent' => 'aplikasi-log'],
            ['slug' => 'aplikasi-log-database', 'nama' => 'Log Database', 'path' => '/aplikasi/log/database', 'icon' => 'database', 'urutan' => 2, 'parent' => 'aplikasi-log'],
            ['slug' => 'aplikasi-log-telegram', 'nama' => 'Log Telegram', 'path' => '/aplikasi/log/telegram', 'icon' => 'users', 'urutan' => 3, 'parent' => 'aplikasi-log'],
            ['slug' => 'aplikasi-log-smtp', 'nama' => 'Log SMTP', 'path' => '/aplikasi/log/smtp', 'icon' => 'mail', 'urutan' => 4, 'parent' => 'aplikasi-log'],
            ['slug' => 'aplikasi-log-fonnte', 'nama' => 'Log Fonnte', 'path' => '/aplikasi/log/fonnte', 'icon' => 'key', 'urutan' => 5, 'parent' => 'aplikasi-log'],
            ['slug' => 'aplikasi-log-n8n', 'nama' => 'Log n8n', 'path' => '/aplikasi/log/n8n', 'icon' => 'puzzle', 'urutan' => 6, 'parent' => 'aplikasi-log'],
            ['slug' => 'aplikasi-log-api-co-id', 'nama' => 'Log api.co.id', 'path' => '/aplikasi/log/api-co-id', 'icon' => 'calendar', 'urutan' => 7, 'parent' => 'aplikasi-log'],

            ['slug' => 'aplikasi-laporkan', 'nama' => 'Laporkan Masalah', 'path' => null, 'icon' => 'alert-triangle', 'urutan' => 5, 'parent' => 'aplikasi'],
            ['slug' => 'aplikasi-laporkan-teknis', 'nama' => 'Teknis & Sistem', 'path' => '/aplikasi/laporkan/teknis', 'icon' => 'settings', 'urutan' => 1, 'parent' => 'aplikasi-laporkan'],
            ['slug' => 'aplikasi-laporkan-nonteknis', 'nama' => 'Non-Teknis / Layanan', 'path' => '/aplikasi/laporkan/nonteknis', 'icon' => 'users', 'urutan' => 2, 'parent' => 'aplikasi-laporkan'],
            ['slug' => 'aplikasi-laporkan-status', 'nama' => 'Status Laporan Saya', 'path' => '/aplikasi/laporkan/status', 'icon' => 'clipboard-check', 'urutan' => 3, 'parent' => 'aplikasi-laporkan'],
            ['slug' => 'aplikasi-laporkan-informasi', 'nama' => 'Informasi Laporan', 'path' => '/aplikasi/laporkan/informasi', 'icon' => 'info', 'urutan' => 4, 'parent' => 'aplikasi-laporkan'],

            ['slug' => 'aplikasi-kotak-masukan', 'nama' => 'Kotak Masukan', 'path' => null, 'icon' => 'mail', 'urutan' => 6, 'parent' => 'aplikasi'],
            ['slug' => 'aplikasi-kotak-ide', 'nama' => 'Ide & Saran', 'path' => '/aplikasi/kotak-masukan/ide', 'icon' => 'file-text', 'urutan' => 1, 'parent' => 'aplikasi-kotak-masukan'],
            ['slug' => 'aplikasi-kotak-ide-status', 'nama' => 'Status Ide & Saran Saya', 'path' => '/aplikasi/kotak-masukan/ide/status', 'icon' => 'clipboard-check', 'urutan' => 2, 'parent' => 'aplikasi-kotak-masukan'],
            ['slug' => 'aplikasi-kotak-testimoni', 'nama' => 'Testimoni & Apresiasi', 'path' => '/aplikasi/kotak-masukan/testimoni', 'icon' => 'flag', 'urutan' => 3, 'parent' => 'aplikasi-kotak-masukan'],
            ['slug' => 'aplikasi-kotak-polling', 'nama' => 'Jajak Pendapat', 'path' => '/aplikasi/kotak-masukan/polling', 'icon' => 'grid-3x3', 'urutan' => 4, 'parent' => 'aplikasi-kotak-masukan', 'is_active' => false],
            ['slug' => 'aplikasi-kotak-informasi', 'nama' => 'Informasi Masukan', 'path' => '/aplikasi/kotak-masukan/informasi', 'icon' => 'scroll-text', 'urutan' => 5, 'parent' => 'aplikasi-kotak-masukan'],
            ['slug' => 'aplikasi-kotak-galeri-testimoni', 'nama' => 'Informasi Testimoni & Apresiasi', 'path' => '/aplikasi/kotak-masukan/galeri-testimoni', 'icon' => 'users-round', 'urutan' => 6, 'parent' => 'aplikasi-kotak-masukan'],
            ['slug' => 'aplikasi-kotak-daftar-testimoni', 'nama' => 'Daftar Testimoni & Apresiasi', 'path' => '/aplikasi/kotak-masukan/daftar-testimoni', 'icon' => 'list', 'urutan' => 7, 'parent' => 'aplikasi-kotak-masukan'],
        ];

        $result = [];

        foreach ($definitions as $definition) {
            $parentId = null;

            if ($definition['parent']) {
                $parentId = $result[$definition['parent']]->id;
            }

            $result[$definition['slug']] = Menu::updateOrCreate(
                ['slug' => $definition['slug']],
                [
                    'parent_id' => $parentId,
                    'nama' => $definition['nama'],
                    'path' => $definition['path'],
                    'icon' => $definition['icon'],
                    'urutan' => $definition['urutan'],
                    'is_active' => $definition['is_active'] ?? true,
                ]
            );
        }

        Menu::where('slug', 'rbac')->update(['is_active' => false]);
        Menu::whereIn('slug', ['pengajian', 'laporan-pengajian'])->update(['is_active' => false]);

        return $result;
    }

    private function seedFiturs(array $menus): array
    {
        $leafMenus = [
            'dashboard',
            'kehadiran',
            'kategori-umur',
            'kalender',
            'laporan-kehadiran',
            'laporan-jamaah',
            'laporan-kegiatan',
            'jamaah',
            'keluarga',
            'master-lokasi',
            'master-pemateri',
            'master-materi',
            'master-kategori-kegiatan',
            'master-lookup',
            'kegiatan',
            'kegiatan-jadwal-rutin',
            'absensi',
            'master-dapukan',
            'master-menu',
            'master-fitur',
            'master-hak-akses',
            'master-matriks',
            'master-users',
            'master-wilayah-fung-pusat',
            'master-wilayah-fung-daerah',
            'master-wilayah-fung-desa',
            'master-wilayah-fung-kelompok',
            'master-wilayah-fung-sub-kelompok',
            'master-wilayah-adm-negara',
            'master-wilayah-adm-provinsi',
            'master-wilayah-adm-kabupaten-kota',
            'master-wilayah-adm-kecamatan',
            'master-wilayah-adm-desa',
            'master-wilayah-adm-kode-pos',
            'aplikasi-konfig',
            'aplikasi-konfig-dokumen',
            'aplikasi-audit-login',
            'aplikasi-audit-akses',
            'aplikasi-audit-konfig',
            'aplikasi-audit-jamaah',
            'aplikasi-log-error',
            'aplikasi-log-database',
            'aplikasi-log-telegram',
            'aplikasi-log-smtp',
            'aplikasi-log-fonnte',
            'aplikasi-log-n8n',
            'aplikasi-log-api-co-id',
            'aplikasi-laporkan-teknis',
            'aplikasi-laporkan-nonteknis',
            'aplikasi-laporkan-status',
            'aplikasi-laporkan-informasi',
            'aplikasi-kotak-ide',
            'aplikasi-kotak-ide-status',
            'aplikasi-kotak-testimoni',
            'aplikasi-kotak-informasi',
            'aplikasi-kotak-galeri-testimoni',
            'aplikasi-kotak-daftar-testimoni',
        ];

        $result = [];

        foreach ($leafMenus as $menuKode) {
            $menu = $menus[$menuKode];

            $result[$menuKode] = Fitur::updateOrCreate(
                ['slug' => $menuKode],
                [
                    'menu_id' => $menu->id,
                    'nama' => $menu->nama,
                    'deskripsi' => null,
                    'is_active' => true,
                ]
            );
        }

        $dashboardMenu = $menus['dashboard'];
        $dashboardSubFiturs = [
            'dashboard-kpi' => 'Kartu Ringkasan (KPI)',
            'dashboard-absensi-overview' => 'Ringkasan Absensi',
            'dashboard-jamaah-kelompok' => 'Jamaah per Kelompok',
            'dashboard-kategori-umur' => 'Kategori Umur',
        ];
        foreach ($dashboardSubFiturs as $slug => $nama) {
            $result[$slug] = Fitur::updateOrCreate(
                ['slug' => $slug],
                [
                    'menu_id' => $dashboardMenu->id,
                    'nama' => $nama,
                    'deskripsi' => 'Widget dashboard',
                    'is_active' => true,
                ]
            );
        }

        $kalenderMenu = $menus['kalender'];
        $kalenderSubFiturs = [
            'kalender-grid' => 'Grid Bulanan',
            'kalender-hari-libur' => 'Hari Libur',
            'kalender-detail-hari' => 'Detail Hari',
        ];
        foreach ($kalenderSubFiturs as $slug => $nama) {
            $result[$slug] = Fitur::updateOrCreate(
                ['slug' => $slug],
                [
                    'menu_id' => $kalenderMenu->id,
                    'nama' => $nama,
                    'deskripsi' => 'Bagian kalender',
                    'is_active' => true,
                ]
            );
        }

        $konfigMenu = $menus['aplikasi-konfig'];
        $konfigSubFiturs = [
            'aplikasi-konfig-identitas' => 'Identitas',
            'aplikasi-konfig-email' => 'Email / SMTP',
            'aplikasi-konfig-database' => 'Database',
            'aplikasi-konfig-integrasi' => 'Integrasi',
            'aplikasi-konfig-branding' => 'Branding',
            'aplikasi-konfig-tema' => 'Tema',
            'aplikasi-konfig-operasional' => 'Operasional',
        ];
        foreach ($konfigSubFiturs as $slug => $nama) {
            $result[$slug] = Fitur::updateOrCreate(
                ['slug' => $slug],
                [
                    'menu_id' => $konfigMenu->id,
                    'nama' => $nama,
                    'deskripsi' => 'Tab konfigurasi sistem',
                    'is_active' => true,
                ]
            );
        }

        $konfigDokumenMenu = $menus['aplikasi-konfig-dokumen'];
        $konfigDokumenSubFiturs = [
            'aplikasi-konfig-dokumen-isi' => 'Isi Dokumen',
            'aplikasi-konfig-dokumen-media' => 'Aktifkan di Media',
        ];
        foreach ($konfigDokumenSubFiturs as $slug => $nama) {
            $result[$slug] = Fitur::updateOrCreate(
                ['slug' => $slug],
                [
                    'menu_id' => $konfigDokumenMenu->id,
                    'nama' => $nama,
                    'deskripsi' => 'Bagian konfigurasi dokumen',
                    'is_active' => true,
                ]
            );
        }

        foreach ($this->listUiChromeCatalog() as $prefix => $config) {
            $menu = $menus[$config['menu']] ?? null;
            if (! $menu) {
                continue;
            }
            foreach ($this->listUiChromeFiturDefs($prefix, $config) as $slug => $nama) {
                $result[$slug] = Fitur::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'menu_id' => $menu->id,
                        'nama' => $nama,
                        'deskripsi' => 'Kontrol UI list dan form (tombol / kolom)',
                        'is_active' => true,
                    ]
                );
            }
        }

        return $result;
    }

    /**
     * @return array<string, array{menu: string, columns: array<string, string>, buttons?: array<string, array{nama: string, aksi: string, slug?: string}>}>
     */
    private function listUiChromeCatalog(): array
    {
        $base = [
            'jamaah' => [
                'menu' => 'jamaah',
                'columns' => [
                    'nama' => 'Kolom Nama',
                    'wilayah_fung_kelompok' => 'Kolom Kelompok',
                    'kategori' => 'Kolom Kategori',
                    'nik' => 'Kolom NIK',
                    'kontak' => 'Kolom Kontak',
                    'status' => 'Kolom Status',
                    'wajah' => 'Kolom Wajah',
                ],
            ],
            'keluarga' => [
                'menu' => 'keluarga',
                'columns' => [
                    'kepala' => 'Kolom Kepala Keluarga',
                    'no_kk' => 'Kolom No. KK',
                    'anggota' => 'Kolom Jumlah Anggota',
                    'alamat' => 'Kolom Alamat',
                    'wilayah_fung_kelompok' => 'Kolom Kelompok',
                    'status' => 'Kolom Status',
                ],
            ],
            'kegiatan' => [
                'menu' => 'kegiatan',
                'columns' => [
                    'judul' => 'Kolom Judul',
                    'kategori' => 'Kolom Kategori',
                    'pemateri' => 'Kolom Pemateri',
                    'materi' => 'Kolom Materi',
                    'lokasi' => 'Kolom Lokasi',
                    'tanggal' => 'Kolom Tanggal',
                    'waktu' => 'Kolom Waktu',
                    'status' => 'Kolom Status',
                    'frekuensi' => 'Kolom Frekuensi',
                    'pola' => 'Kolom Pola',
                    'cakupan' => 'Kolom Cakupan',
                    'effective_from' => 'Kolom Berlaku Dari',
                    'is_active' => 'Kolom Status Jadwal',
                ],
            ],
            'users' => [
                'menu' => 'master-users',
                'columns' => [
                    'nama' => 'Kolom Nama',
                    'username' => 'Kolom Username',
                    'dapukan' => 'Kolom Dapukan',
                    'cakupan' => 'Kolom Cakupan',
                    'status' => 'Kolom Status',
                ],
            ],
            'kehadiran' => [
                'menu' => 'kehadiran',
                'columns' => [
                    'nama' => 'Kolom Nama',
                    'metode' => 'Kolom Metode',
                    'waktu' => 'Kolom Waktu',
                ],
            ],
            'kategori_umur' => [
                'menu' => 'kategori-umur',
                'columns' => [
                    'grup' => 'Kolom Grup',
                    'kategori' => 'Kolom Kategori',
                    'rentang' => 'Kolom Rentang',
                    'jumlah' => 'Kolom Jumlah',
                ],
            ],
            'laporan_kehadiran' => [
                'menu' => 'laporan-kehadiran',
                'columns' => [
                    'waktu' => 'Kolom Waktu',
                    'nama' => 'Kolom Nama',
                    'wilayah_fung_kelompok' => 'Kolom Kelompok',
                    'sesi' => 'Kolom Sesi',
                    'jenis' => 'Kolom Jenis',
                    'metode' => 'Kolom Metode',
                ],
            ],
            'laporan_jamaah' => [
                'menu' => 'laporan-jamaah',
                'columns' => [
                    'nama' => 'Kolom Nama',
                    'wilayah_fung_kelompok' => 'Kolom Kelompok',
                    'kategori' => 'Kolom Kategori',
                    'nik' => 'Kolom NIK',
                    'kontak' => 'Kolom Kontak',
                    'status' => 'Kolom Status',
                    'wajah' => 'Kolom Wajah',
                ],
            ],
            'laporan_kegiatan' => [
                'menu' => 'laporan-kegiatan',
                'columns' => [
                    'judul' => 'Kolom Judul',
                    'kategori' => 'Kolom Kategori',
                    'pemateri' => 'Kolom Pemateri',
                    'lokasi' => 'Kolom Lokasi',
                    'tanggal' => 'Kolom Tanggal',
                    'waktu' => 'Kolom Waktu',
                    'status' => 'Kolom Status',
                ],
            ],
            'konfig_dokumen' => [
                'menu' => 'aplikasi-konfig-dokumen',
                'columns' => [
                    'nama_cetakan' => 'Kolom Nama Cetakan',
                    'value' => 'Kolom Value',
                    'header' => 'Kolom Header',
                    'media' => 'Kolom Media',
                    'status' => 'Kolom Status',
                ],
            ],
            'audit_login' => [
                'menu' => 'aplikasi-audit-login',
                'columns' => [
                    'waktu' => 'Kolom Waktu',
                    'event' => 'Kolom Event',
                    'hasil' => 'Kolom Hasil',
                    'username' => 'Kolom Username',
                    'user' => 'Kolom Pengguna',
                    'alasan' => 'Kolom Alasan',
                    'ip' => 'Kolom IP',
                    'perangkat' => 'Kolom Perangkat',
                ],
            ],
            'audit_access' => [
                'menu' => 'aplikasi-audit-akses',
                'columns' => [
                    'waktu' => 'Kolom Waktu',
                    'aksi' => 'Kolom Aksi',
                    'entitas' => 'Kolom Entitas',
                    'ringkasan' => 'Kolom Ringkasan',
                    'aktor' => 'Kolom Aktor',
                    'detail' => 'Kolom Detail',
                ],
            ],
            'audit_konfig' => [
                'menu' => 'aplikasi-audit-konfig',
                'columns' => [
                    'waktu' => 'Kolom Waktu',
                    'aksi' => 'Kolom Aksi',
                    'entitas' => 'Kolom Entitas',
                    'ringkasan' => 'Kolom Ringkasan',
                    'aktor' => 'Kolom Aktor',
                    'detail' => 'Kolom Detail',
                ],
            ],
            'audit_jamaah' => [
                'menu' => 'aplikasi-audit-jamaah',
                'columns' => [
                    'waktu' => 'Kolom Waktu',
                    'aksi' => 'Kolom Aksi',
                    'entitas' => 'Kolom Entitas',
                    'ringkasan' => 'Kolom Ringkasan',
                    'aktor' => 'Kolom Aktor',
                    'detail' => 'Kolom Detail',
                ],
            ],
            'app_error_log' => [
                'menu' => 'aplikasi-log-error',
                'columns' => [
                    'waktu' => 'Kolom Waktu',
                    'level' => 'Kolom Level',
                    'status' => 'Kolom Status',
                    'exception' => 'Kolom Exception',
                    'pesan' => 'Kolom Pesan',
                    'endpoint' => 'Kolom Endpoint',
                    'user' => 'Kolom Pengguna',
                    'detail' => 'Kolom Detail',
                ],
            ],
            'integration_log_database' => [
                'menu' => 'aplikasi-log-database',
                'columns' => [
                    'waktu' => 'Kolom Waktu',
                    'level' => 'Kolom Level',
                    'event' => 'Kolom Event',
                    'judul' => 'Kolom Judul',
                    'pesan' => 'Kolom Pesan',
                    'aktor' => 'Kolom Aktor',
                    'detail' => 'Kolom Detail',
                ],
                'buttons' => [
                    'check' => ['nama' => 'Cek Koneksi', 'aksi' => 'update'],
                    'note' => ['nama' => 'Catat Log', 'aksi' => 'create'],
                ],
            ],
            'integration_log_telegram' => [
                'menu' => 'aplikasi-log-telegram',
                'columns' => [
                    'waktu' => 'Kolom Waktu',
                    'level' => 'Kolom Level',
                    'event' => 'Kolom Event',
                    'judul' => 'Kolom Judul',
                    'pesan' => 'Kolom Pesan',
                    'aktor' => 'Kolom Aktor',
                    'detail' => 'Kolom Detail',
                ],
                'buttons' => [
                    'check' => ['nama' => 'Cek Koneksi', 'aksi' => 'update'],
                    'note' => ['nama' => 'Catat Log', 'aksi' => 'create'],
                ],
            ],
            'integration_log_smtp' => [
                'menu' => 'aplikasi-log-smtp',
                'columns' => [
                    'waktu' => 'Kolom Waktu',
                    'level' => 'Kolom Level',
                    'event' => 'Kolom Event',
                    'judul' => 'Kolom Judul',
                    'pesan' => 'Kolom Pesan',
                    'aktor' => 'Kolom Aktor',
                    'detail' => 'Kolom Detail',
                ],
                'buttons' => [
                    'check' => ['nama' => 'Cek Koneksi', 'aksi' => 'update'],
                    'note' => ['nama' => 'Catat Log', 'aksi' => 'create'],
                ],
            ],
            'integration_log_fonnte' => [
                'menu' => 'aplikasi-log-fonnte',
                'columns' => [
                    'waktu' => 'Kolom Waktu',
                    'level' => 'Kolom Level',
                    'event' => 'Kolom Event',
                    'judul' => 'Kolom Judul',
                    'pesan' => 'Kolom Pesan',
                    'aktor' => 'Kolom Aktor',
                    'detail' => 'Kolom Detail',
                ],
                'buttons' => [
                    'check' => ['nama' => 'Cek Koneksi', 'aksi' => 'update'],
                    'note' => ['nama' => 'Catat Log', 'aksi' => 'create'],
                ],
            ],
            'integration_log_n8n' => [
                'menu' => 'aplikasi-log-n8n',
                'columns' => [
                    'waktu' => 'Kolom Waktu',
                    'level' => 'Kolom Level',
                    'event' => 'Kolom Event',
                    'judul' => 'Kolom Judul',
                    'pesan' => 'Kolom Pesan',
                    'aktor' => 'Kolom Aktor',
                    'detail' => 'Kolom Detail',
                ],
                'buttons' => [
                    'check' => ['nama' => 'Cek Koneksi', 'aksi' => 'update'],
                    'note' => ['nama' => 'Catat Log', 'aksi' => 'create'],
                ],
            ],
            'integration_log_api_co_id' => [
                'menu' => 'aplikasi-log-api-co-id',
                'columns' => [
                    'waktu' => 'Kolom Waktu',
                    'level' => 'Kolom Level',
                    'event' => 'Kolom Event',
                    'judul' => 'Kolom Judul',
                    'pesan' => 'Kolom Pesan',
                    'aktor' => 'Kolom Aktor',
                    'detail' => 'Kolom Detail',
                ],
                'buttons' => [
                    'check' => ['nama' => 'Cek Koneksi', 'aksi' => 'update'],
                    'note' => ['nama' => 'Catat Log', 'aksi' => 'create'],
                ],
            ],
            'matriks' => [
                'menu' => 'master-matriks',
                'columns' => [],
            ],
            'lokasi' => [
                'menu' => 'master-lokasi',
                'columns' => [
                    'nama' => 'Kolom Nama',
                    'jenis' => 'Kolom Jenis',
                    'wilayah' => 'Kolom Wilayah',
                    'maps' => 'Kolom Maps',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'pemateri' => [
                'menu' => 'master-pemateri',
                'columns' => [
                    'nama' => 'Kolom Nama',
                    'kontak' => 'Kolom Kontak',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'materi' => [
                'menu' => 'master-materi',
                'columns' => [
                    'nama' => 'Kolom Nama',
                    'deskripsi' => 'Kolom Deskripsi',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'kategori_kegiatan' => [
                'menu' => 'master-kategori-kegiatan',
                'columns' => [
                    'nama' => 'Kolom Nama',
                    'calendar_color' => 'Kolom Warna',
                    'deskripsi' => 'Kolom Deskripsi',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'lookup' => [
                'menu' => 'master-lookup',
                'columns' => [
                    'lookup_type' => 'Kolom Tipe',
                    'lookup_name' => 'Kolom Nama',
                    'lookup_value' => 'Kolom Value',
                    'lookup_kode' => 'Kolom Kode',
                    'lookup_urutan' => 'Kolom Urutan',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'wilayah_fung_pusat' => [
                'menu' => 'master-wilayah-fung-pusat',
                'columns' => [
                    'kode' => 'Kolom Kode',
                    'nama' => 'Kolom Nama',
                    'deskripsi' => 'Kolom Deskripsi',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'wilayah_fung_daerah' => [
                'menu' => 'master-wilayah-fung-daerah',
                'columns' => [
                    'kode' => 'Kolom Kode',
                    'wilayah_fung_pusat' => 'Kolom Pusat',
                    'nama' => 'Kolom Nama',
                    'deskripsi' => 'Kolom Deskripsi',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'wilayah_fung_desa' => [
                'menu' => 'master-wilayah-fung-desa',
                'columns' => [
                    'kode' => 'Kolom Kode',
                    'wilayah_fung_daerah' => 'Kolom Daerah',
                    'nama' => 'Kolom Nama',
                    'deskripsi' => 'Kolom Deskripsi',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'wilayah_fung_kelompok' => [
                'menu' => 'master-wilayah-fung-kelompok',
                'columns' => [
                    'kode' => 'Kolom Kode',
                    'wilayah_fung_desa' => 'Kolom Desa',
                    'singkatan' => 'Kolom Singkatan',
                    'nama' => 'Kolom Nama',
                    'deskripsi' => 'Kolom Deskripsi',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'wilayah_fung_sub_kelompok' => [
                'menu' => 'master-wilayah-fung-sub-kelompok',
                'columns' => [
                    'kode' => 'Kolom Kode',
                    'wilayah_fung_kelompok' => 'Kolom Kelompok',
                    'nama' => 'Kolom Nama',
                    'deskripsi' => 'Kolom Deskripsi',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'wilayah_adm_negara' => [
                'menu' => 'master-wilayah-adm-negara',
                'columns' => [
                    'kode' => 'Kolom Kode',
                    'nama' => 'Kolom Nama',
                    'iso3' => 'Kolom ISO3',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'wilayah_adm_provinsi' => [
                'menu' => 'master-wilayah-adm-provinsi',
                'columns' => [
                    'kode' => 'Kolom Kode',
                    'wilayah_adm_negara' => 'Kolom Negara',
                    'singkatan' => 'Kolom SNI',
                    'nama' => 'Kolom Nama',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'wilayah_adm_kabupaten_kota' => [
                'menu' => 'master-wilayah-adm-kabupaten-kota',
                'columns' => [
                    'kode' => 'Kolom Kode',
                    'wilayah_adm_provinsi' => 'Kolom Provinsi',
                    'singkatan' => 'Kolom SNI',
                    'nama' => 'Kolom Nama',
                    'singkatan_kawasan_metropolitan' => 'Kolom Kawasan Metro',
                    'jenis' => 'Kolom Jenis',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'wilayah_adm_kecamatan' => [
                'menu' => 'master-wilayah-adm-kecamatan',
                'columns' => [
                    'kode' => 'Kolom Kode',
                    'wilayah_adm_kabupaten_kota' => 'Kolom Kabupaten/Kota',
                    'nama' => 'Kolom Nama',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'wilayah_adm_desa' => [
                'menu' => 'master-wilayah-adm-desa',
                'columns' => [
                    'kode' => 'Kolom Kode',
                    'wilayah_adm_kecamatan' => 'Kolom Kecamatan',
                    'nama' => 'Kolom Nama',
                    'jenis' => 'Kolom Jenis',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'wilayah_adm_kode_pos' => [
                'menu' => 'master-wilayah-adm-kode-pos',
                'columns' => [
                    'kode' => 'Kolom Kode',
                    'wilayah' => 'Kolom Wilayah',
                    'wilayah_adm_negara' => 'Kolom Negara',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'dapukan' => [
                'menu' => 'master-dapukan',
                'columns' => [
                    'slug' => 'Kolom Slug',
                    'nama' => 'Kolom Nama',
                    'urutan' => 'Kolom Urutan',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'menu' => [
                'menu' => 'master-menu',
                'columns' => [
                    'slug' => 'Kolom Slug',
                    'nama' => 'Kolom Nama',
                    'path' => 'Kolom Path',
                    'icon' => 'Kolom Icon',
                    'parent_id' => 'Kolom Parent',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'fitur' => [
                'menu' => 'master-fitur',
                'columns' => [
                    'slug' => 'Kolom Slug',
                    'nama' => 'Kolom Nama',
                    'menu' => 'Kolom Menu',
                    'is_active' => 'Kolom Status',
                ],
            ],
            'hak_akses' => [
                'menu' => 'master-hak-akses',
                'columns' => [
                    'slug' => 'Kolom Slug',
                    'nama' => 'Kolom Nama',
                    'aksi' => 'Kolom Aksi',
                    'fitur' => 'Kolom Fitur',
                ],
            ],
        ];

        $crudPrefixes = [
            'jamaah', 'keluarga', 'kegiatan', 'users', 'lokasi', 'pemateri', 'materi',
            'kategori_kegiatan', 'lookup', 'wilayah_fung_pusat', 'wilayah_fung_daerah', 'wilayah_fung_desa', 'wilayah_fung_kelompok', 'wilayah_fung_sub_kelompok',
            'wilayah_adm_negara', 'wilayah_adm_provinsi', 'wilayah_adm_kabupaten_kota', 'wilayah_adm_kecamatan',
            'wilayah_adm_desa', 'wilayah_adm_kode_pos', 'dapukan', 'menu', 'fitur', 'hak_akses',
        ];

        foreach ($base as $prefix => &$config) {
            if (in_array($prefix, $crudPrefixes, true)) {
                $config['buttons'] = $this->crudAndExportButtons();
            } else {
                $config['buttons'] = $this->exportOnlyButtons();
            }
        }
        unset($config);

        $base['jamaah']['buttons']['enroll_face'] = [
            'nama' => 'Tombol Wajah',
            'aksi' => 'execute',
            'slug' => 'jamaah.enroll_face',
        ];
        $base['konfig_dokumen']['buttons']['update'] = [
            'nama' => 'Tombol Ubah',
            'aksi' => 'update',
            'slug' => 'konfig_dokumen.update',
        ];
        $base['matriks']['buttons']['update'] = [
            'nama' => 'Tombol Simpan Matriks',
            'aksi' => 'update',
            'slug' => 'matriks.update',
        ];
        $base['users']['buttons']['update'] = [
            'nama' => 'Tombol Edit / Nonaktifkan',
            'aksi' => 'update',
        ];

        return $base;
    }

    /**
     * @return array<string, array{nama: string, aksi: string, slug?: string}>
     */
    private function exportOnlyButtons(): array
    {
        return [
            'print' => ['nama' => 'Tombol Cetak / PDF', 'aksi' => 'execute'],
            'export_csv' => ['nama' => 'Tombol Unduh CSV', 'aksi' => 'execute'],
            'export_excel' => ['nama' => 'Tombol Unduh Excel', 'aksi' => 'execute'],
        ];
    }

    /**
     * @return array<string, array{nama: string, aksi: string, slug?: string}>
     */
    private function crudAndExportButtons(): array
    {
        return array_merge([
            'create' => ['nama' => 'Tombol Tambah', 'aksi' => 'create'],
            'update' => ['nama' => 'Tombol Edit', 'aksi' => 'update'],
            'delete' => ['nama' => 'Tombol Hapus', 'aksi' => 'delete'],
        ], $this->exportOnlyButtons());
    }

    /**
     * @param  array{menu: string, columns: array<string, string>, buttons?: array<string, array{nama: string, aksi: string, slug?: string}>}  $config
     * @return array<string, string>
     */
    private function listUiChromeFiturDefs(string $prefix, array $config): array
    {
        $defs = [];
        foreach ($config['buttons'] ?? [] as $key => $button) {
            $defs["{$prefix}-btn-{$key}"] = $button['nama'];
        }
        foreach ($config['columns'] as $key => $nama) {
            $defs["{$prefix}-col-{$key}"] = $nama;
        }

        return $defs;
    }

    private function buttonActionSlug(string $prefix, string $key, array $button): string
    {
        return $button['slug'] ?? "{$prefix}.{$key}";
    }

    /**
     * Kode chrome yang dilampirkan otomatis (kolom + export + btn.view bila aksi sudah ada).
     *
     * @return list<string>
     */
    private function listUiChromePermissionCodes(string $prefix, array $existingCodes = []): array
    {
        $config = $this->listUiChromeCatalog()[$prefix] ?? null;
        if (! $config) {
            return [];
        }

        $codes = [];
        $exportKeys = ['print', 'export_csv', 'export_excel'];

        foreach ($config['buttons'] ?? [] as $key => $button) {
            $actionSlug = $this->buttonActionSlug($prefix, $key, $button);
            $viewSlug = "{$prefix}.btn.{$key}.view";
            if (in_array($key, $exportKeys, true)) {
                $codes[] = $viewSlug;
                $codes[] = $actionSlug;
                continue;
            }
            if (in_array($actionSlug, $existingCodes, true)) {
                $codes[] = $viewSlug;
            }
        }

        foreach (array_keys($config['columns']) as $key) {
            $codes[] = "{$prefix}.col.{$key}.view";
            $moduleUpdate = "{$prefix}.update";
            if ($key !== 'kode' && in_array($moduleUpdate, $existingCodes, true)) {
                $codes[] = "{$prefix}.col.{$key}.update";
            }
        }

        return $codes;
    }

    /**
     * @deprecated unused — kept for clarity; prefer listUiChromePermissionCodes
     * @return list<string>
     */
    private function allListUiChromeCodes(): array
    {
        $codes = [];
        foreach (array_keys($this->listUiChromeCatalog()) as $prefix) {
            $codes = array_merge($codes, $this->listUiChromePermissionCodes($prefix));
        }

        return $codes;
    }

    private function seedHakAkses(array $fiturs): array
    {
        $definitions = [
            'dashboard' => [
                ['slug' => 'dashboard.view', 'nama' => 'Lihat Dashboard', 'aksi' => 'view'],
            ],
            'dashboard-kpi' => [
                ['slug' => 'dashboard.kpi.view', 'nama' => 'Lihat Kartu Ringkasan (KPI)', 'aksi' => 'view'],
            ],
            'dashboard-absensi-overview' => [
                ['slug' => 'dashboard.absensi_overview.view', 'nama' => 'Lihat Ringkasan Absensi', 'aksi' => 'view'],
            ],
            'dashboard-jamaah-kelompok' => [
                ['slug' => 'dashboard.jamaah_kelompok.view', 'nama' => 'Lihat Jamaah per Kelompok', 'aksi' => 'view'],
            ],
            'dashboard-kategori-umur' => [
                ['slug' => 'dashboard.kategori_umur.view', 'nama' => 'Lihat Kategori Umur (Dashboard)', 'aksi' => 'view'],
            ],
            'kehadiran' => [
                ['slug' => 'kehadiran.view', 'nama' => 'Lihat Daftar Kehadiran', 'aksi' => 'view'],
            ],
            'kategori-umur' => [
                ['slug' => 'kategori_umur.view', 'nama' => 'Lihat Kategori Umur', 'aksi' => 'view'],
            ],
            'kalender' => [
                ['slug' => 'kalender.view', 'nama' => 'Lihat Kalender', 'aksi' => 'view'],
            ],
            'kalender-grid' => [
                ['slug' => 'kalender.grid.view', 'nama' => 'Lihat Grid Bulanan', 'aksi' => 'view'],
            ],
            'kalender-hari-libur' => [
                ['slug' => 'kalender.hari_libur.view', 'nama' => 'Lihat Hari Libur', 'aksi' => 'view'],
            ],
            'kalender-detail-hari' => [
                ['slug' => 'kalender.detail_hari.view', 'nama' => 'Lihat Detail Hari', 'aksi' => 'view'],
            ],
            'laporan-kehadiran' => [
                ['slug' => 'laporan_kehadiran.view', 'nama' => 'Lihat Laporan Kehadiran', 'aksi' => 'view'],
            ],
            'laporan-jamaah' => [
                ['slug' => 'laporan_jamaah.view', 'nama' => 'Lihat Laporan Jamaah', 'aksi' => 'view'],
            ],

            'laporan-kegiatan' => [
                ['slug' => 'laporan_kegiatan.view', 'nama' => 'Lihat Laporan Kegiatan', 'aksi' => 'view'],
            ],
            'jamaah' => [
                ['slug' => 'jamaah.view', 'nama' => 'Lihat Jamaah', 'aksi' => 'view'],
            ],
            'keluarga' => [
                ['slug' => 'keluarga.view', 'nama' => 'Lihat Keluarga', 'aksi' => 'view'],
            ],
            'master-lokasi' => [
                ['slug' => 'lokasi.view', 'nama' => 'Lihat Lokasi', 'aksi' => 'view'],
            ],
            'master-pemateri' => [
                ['slug' => 'pemateri.view', 'nama' => 'Lihat Pemateri', 'aksi' => 'view'],
            ],
            'master-materi' => [
                ['slug' => 'materi.view', 'nama' => 'Lihat Materi', 'aksi' => 'view'],
            ],
            'master-kategori-kegiatan' => [
                ['slug' => 'kategori_kegiatan.view', 'nama' => 'Lihat Kategori Kegiatan', 'aksi' => 'view'],
            ],
            'master-lookup' => [
                ['slug' => 'lookup.view', 'nama' => 'Lihat Lookup', 'aksi' => 'view'],
            ],
            'kegiatan' => [
                ['slug' => 'kegiatan.view', 'nama' => 'Lihat Kegiatan', 'aksi' => 'view'],
            ],
            'kegiatan-jadwal-rutin' => [
                ['slug' => 'kegiatan.view', 'nama' => 'Lihat Jadwal Rutin Kegiatan', 'aksi' => 'view'],
            ],
            'absensi' => [
                ['slug' => 'absensi.view', 'nama' => 'Lihat Absensi', 'aksi' => 'view'],
                ['slug' => 'absensi.create', 'nama' => 'Kelola Sesi Absensi', 'aksi' => 'create'],
                ['slug' => 'absensi.execute', 'nama' => 'Check-in Absensi', 'aksi' => 'execute'],
            ],
            'master-dapukan' => [
                ['slug' => 'dapukan.view', 'nama' => 'Lihat Dapukan', 'aksi' => 'view'],
            ],
            'master-menu' => [
                ['slug' => 'menu.view', 'nama' => 'Lihat Menu', 'aksi' => 'view'],
            ],
            'master-fitur' => [
                ['slug' => 'fitur.view', 'nama' => 'Lihat Fitur', 'aksi' => 'view'],
            ],
            'master-hak-akses' => [
                ['slug' => 'hak_akses.view', 'nama' => 'Lihat Hak Akses', 'aksi' => 'view'],
            ],
            'master-matriks' => [
                ['slug' => 'matriks.view', 'nama' => 'Lihat Matriks Akses', 'aksi' => 'view'],
            ],
            'master-users' => [
                ['slug' => 'users.view', 'nama' => 'Lihat Pengguna', 'aksi' => 'view'],
            ],
            'master-wilayah-fung-pusat' => [
                ['slug' => 'wilayah_fung_pusat.view', 'nama' => 'Lihat Pusat', 'aksi' => 'view'],
            ],
            'master-wilayah-fung-daerah' => [
                ['slug' => 'wilayah_fung_daerah.view', 'nama' => 'Lihat Daerah', 'aksi' => 'view'],
            ],
            'master-wilayah-fung-desa' => [
                ['slug' => 'wilayah_fung_desa.view', 'nama' => 'Lihat Desa', 'aksi' => 'view'],
            ],
            'master-wilayah-fung-kelompok' => [
                ['slug' => 'wilayah_fung_kelompok.view', 'nama' => 'Lihat Kelompok', 'aksi' => 'view'],
            ],
            'master-wilayah-fung-sub-kelompok' => [
                ['slug' => 'wilayah_fung_sub_kelompok.view', 'nama' => 'Lihat Sub Kelompok', 'aksi' => 'view'],
            ],
            'master-wilayah-adm-negara' => [
                ['slug' => 'wilayah_adm_negara.view', 'nama' => 'Lihat Negara', 'aksi' => 'view'],
            ],
            'master-wilayah-adm-provinsi' => [
                ['slug' => 'wilayah_adm_provinsi.view', 'nama' => 'Lihat Provinsi', 'aksi' => 'view'],
            ],
            'master-wilayah-adm-kabupaten-kota' => [
                ['slug' => 'wilayah_adm_kabupaten_kota.view', 'nama' => 'Lihat Kabupaten/Kota', 'aksi' => 'view'],
            ],
            'master-wilayah-adm-kecamatan' => [
                ['slug' => 'wilayah_adm_kecamatan.view', 'nama' => 'Lihat Kecamatan', 'aksi' => 'view'],
            ],
            'master-wilayah-adm-desa' => [
                ['slug' => 'wilayah_adm_desa.view', 'nama' => 'Lihat Desa/Kelurahan', 'aksi' => 'view'],
            ],
            'master-wilayah-adm-kode-pos' => [
                ['slug' => 'wilayah_adm_kode_pos.view', 'nama' => 'Lihat Kode Pos', 'aksi' => 'view'],
            ],
            'aplikasi-konfig' => [
                ['slug' => 'konfig.view', 'nama' => 'Lihat Konfigurasi Sistem', 'aksi' => 'view'],
                ['slug' => 'konfig.update', 'nama' => 'Ubah Konfigurasi Sistem', 'aksi' => 'update'],
            ],
            'aplikasi-konfig-identitas' => [
                ['slug' => 'konfig.identitas.view', 'nama' => 'Tab Identitas', 'aksi' => 'view'],
            ],
            'aplikasi-konfig-email' => [
                ['slug' => 'konfig.email.view', 'nama' => 'Tab Email / SMTP', 'aksi' => 'view'],
            ],
            'aplikasi-konfig-database' => [
                ['slug' => 'konfig.database.view', 'nama' => 'Tab Database', 'aksi' => 'view'],
            ],
            'aplikasi-konfig-integrasi' => [
                ['slug' => 'konfig.integrasi.view', 'nama' => 'Tab Integrasi', 'aksi' => 'view'],
            ],
            'aplikasi-konfig-branding' => [
                ['slug' => 'konfig.branding.view', 'nama' => 'Tab Branding', 'aksi' => 'view'],
            ],
            'aplikasi-konfig-tema' => [
                ['slug' => 'konfig.tema.view', 'nama' => 'Tab Tema', 'aksi' => 'view'],
            ],
            'aplikasi-konfig-operasional' => [
                ['slug' => 'konfig.operasional.view', 'nama' => 'Tab Operasional', 'aksi' => 'view'],
            ],
            'aplikasi-konfig-dokumen' => [
                ['slug' => 'konfig_dokumen.view', 'nama' => 'Lihat Konfigurasi Dokumen', 'aksi' => 'view'],
            ],
            'aplikasi-konfig-dokumen-isi' => [
                ['slug' => 'konfig_dokumen.isi.view', 'nama' => 'Isi Dokumen', 'aksi' => 'view'],
            ],
            'aplikasi-konfig-dokumen-media' => [
                ['slug' => 'konfig_dokumen.media.view', 'nama' => 'Aktifkan di Media', 'aksi' => 'view'],
            ],
            'aplikasi-audit-login' => [
                ['slug' => 'audit_login.view', 'nama' => 'Lihat Audit Login', 'aksi' => 'view'],
            ],
            'aplikasi-audit-akses' => [
                ['slug' => 'audit_access.view', 'nama' => 'Lihat Audit Akses', 'aksi' => 'view'],
            ],
            'aplikasi-audit-konfig' => [
                ['slug' => 'audit_konfig.view', 'nama' => 'Lihat Audit Konfigurasi', 'aksi' => 'view'],
            ],
            'aplikasi-audit-jamaah' => [
                ['slug' => 'audit_jamaah.view', 'nama' => 'Lihat Audit Jamaah', 'aksi' => 'view'],
            ],
            'aplikasi-log-error' => [
                ['slug' => 'app_error_log.view', 'nama' => 'Lihat Log Error Aplikasi', 'aksi' => 'view'],
                ['slug' => 'app_error_log.update', 'nama' => 'Ubah Status Log Error', 'aksi' => 'update'],
                ['slug' => 'app_error_log.clear', 'nama' => 'Bersihkan Log Error', 'aksi' => 'delete'],
            ],
            'aplikasi-log-database' => [
                ['slug' => 'integration_log_database.view', 'nama' => 'Lihat Log Database', 'aksi' => 'view'],
            ],
            'aplikasi-log-telegram' => [
                ['slug' => 'integration_log_telegram.view', 'nama' => 'Lihat Log Telegram', 'aksi' => 'view'],
            ],
            'aplikasi-log-smtp' => [
                ['slug' => 'integration_log_smtp.view', 'nama' => 'Lihat Log SMTP', 'aksi' => 'view'],
            ],
            'aplikasi-log-fonnte' => [
                ['slug' => 'integration_log_fonnte.view', 'nama' => 'Lihat Log Fonnte', 'aksi' => 'view'],
            ],
            'aplikasi-log-n8n' => [
                ['slug' => 'integration_log_n8n.view', 'nama' => 'Lihat Log n8n', 'aksi' => 'view'],
            ],
            'aplikasi-log-api-co-id' => [
                ['slug' => 'integration_log_api_co_id.view', 'nama' => 'Lihat Log api.co.id', 'aksi' => 'view'],
            ],
            'aplikasi-laporkan-teknis' => [
                ['slug' => 'app_report_teknis.view', 'nama' => 'Lihat Laporan Teknis', 'aksi' => 'view'],
                ['slug' => 'app_report_teknis.create', 'nama' => 'Buat Laporan Teknis', 'aksi' => 'create'],
            ],
            'aplikasi-laporkan-nonteknis' => [
                ['slug' => 'app_report_nonteknis.view', 'nama' => 'Lihat Laporan Non-Teknis', 'aksi' => 'view'],
                ['slug' => 'app_report_nonteknis.create', 'nama' => 'Buat Laporan Non-Teknis', 'aksi' => 'create'],
            ],
            'aplikasi-laporkan-status' => [
                ['slug' => 'app_report_status.view', 'nama' => 'Lihat Status Laporan Saya', 'aksi' => 'view'],
            ],
            'aplikasi-laporkan-informasi' => [
                ['slug' => 'app_report_admin.view', 'nama' => 'Lihat Informasi Laporan', 'aksi' => 'view'],
                ['slug' => 'app_report_admin.update', 'nama' => 'Ubah Status Laporan', 'aksi' => 'update'],
            ],
            'aplikasi-kotak-ide' => [
                ['slug' => 'app_feedback_idea.view', 'nama' => 'Lihat Ide & Saran', 'aksi' => 'view'],
                ['slug' => 'app_feedback_idea.create', 'nama' => 'Kirim Ide & Saran', 'aksi' => 'create'],
            ],
            'aplikasi-kotak-ide-status' => [
                ['slug' => 'app_feedback_idea_status.view', 'nama' => 'Lihat Status Ide & Saran Saya', 'aksi' => 'view'],
            ],
            'aplikasi-kotak-testimoni' => [
                ['slug' => 'app_feedback_testimonial.view', 'nama' => 'Lihat Testimoni', 'aksi' => 'view'],
                ['slug' => 'app_feedback_testimonial.create', 'nama' => 'Kirim Testimoni', 'aksi' => 'create'],
            ],
            'aplikasi-kotak-polling' => [
                ['slug' => 'app_poll.view', 'nama' => 'Lihat Jajak Pendapat', 'aksi' => 'view'],
                ['slug' => 'app_poll.vote', 'nama' => 'Voting Jajak Pendapat', 'aksi' => 'vote'],
            ],
            'aplikasi-kotak-informasi' => [
                ['slug' => 'app_feedback_admin.view', 'nama' => 'Lihat Informasi Masukan', 'aksi' => 'view'],
                ['slug' => 'app_feedback_admin.update', 'nama' => 'Ubah Informasi Masukan', 'aksi' => 'update'],
                ['slug' => 'app_poll.manage', 'nama' => 'Kelola Jajak Pendapat', 'aksi' => 'manage'],
            ],
            'aplikasi-kotak-galeri-testimoni' => [
                ['slug' => 'app_feedback_gallery.view', 'nama' => 'Lihat Galeri Testimoni', 'aksi' => 'view'],
            ],
            'aplikasi-kotak-daftar-testimoni' => [
                ['slug' => 'app_feedback_testimonial_admin.view', 'nama' => 'Lihat Daftar Testimoni', 'aksi' => 'view'],
                ['slug' => 'app_feedback_testimonial_admin.update', 'nama' => 'Kelola Tampilan Testimoni', 'aksi' => 'update'],
            ],
        ];

        foreach ($this->listUiChromeCatalog() as $prefix => $config) {
            foreach ($config['buttons'] ?? [] as $key => $button) {
                $actionSlug = $this->buttonActionSlug($prefix, $key, $button);
                $definitions["{$prefix}-btn-{$key}"] = [
                    [
                        'slug' => "{$prefix}.btn.{$key}.view",
                        'nama' => 'Lihat '.$button['nama'],
                        'aksi' => 'view',
                    ],
                    [
                        'slug' => $actionSlug,
                        'nama' => $button['nama'],
                        'aksi' => $button['aksi'],
                    ],
                ];
            }
            foreach ($config['columns'] as $key => $nama) {
                $definitions["{$prefix}-col-{$key}"] = [
                    ['slug' => "{$prefix}.col.{$key}.view", 'nama' => $nama, 'aksi' => 'view'],
                    ['slug' => "{$prefix}.col.{$key}.update", 'nama' => 'Ubah '.$nama, 'aksi' => 'update'],
                ];
            }
        }

        $result = [];

        foreach ($definitions as $fiturKode => $permissions) {
            $fitur = $fiturs[$fiturKode] ?? null;
            if (! $fitur) {
                continue;
            }

            foreach ($permissions as $permission) {
                $result[$permission['slug']] = HakAkses::updateOrCreate(
                    ['slug' => $permission['slug']],
                    [
                        'fitur_id' => $fitur->id,
                        'nama' => $permission['nama'],
                        'aksi' => $permission['aksi'],
                    ]
                );
            }
        }

        return $result;
    }

    private function assignPermissions(array $dapukan, array $permissions): void
    {
        $ids = fn (array $codes) => collect($codes)
            ->map(fn (string $kode) => $permissions[$kode]->id ?? null)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $dashboardWidgetCodes = [
            'dashboard.kpi.view',
            'dashboard.absensi_overview.view',
            'dashboard.jamaah_kelompok.view',
            'dashboard.kategori_umur.view',
        ];

        $kalenderSectionCodes = [
            'kalender.grid.view',
            'kalender.hari_libur.view',
            'kalender.detail_hari.view',
        ];

        $feedbackUserCodes = [
            'app_report_teknis.view', 'app_report_teknis.create',
            'app_report_nonteknis.view', 'app_report_nonteknis.create',
            'app_report_status.view',
            'app_feedback_idea.view', 'app_feedback_idea.create',
            'app_feedback_idea_status.view',
            'app_feedback_testimonial.view', 'app_feedback_testimonial.create',
            'app_feedback_gallery.view',
        ];

        $opsCodes = $this->withListUiChrome([
            'dashboard.view',
            ...$dashboardWidgetCodes,
            'kehadiran.view',
            'kategori_umur.view',
            'kalender.view',
            ...$kalenderSectionCodes,
            'laporan_kehadiran.view',
            'laporan_jamaah.view',
            'laporan_kegiatan.view',
            'jamaah.view', 'jamaah.create', 'jamaah.update', 'jamaah.delete', 'jamaah.enroll_face',
            'keluarga.view', 'keluarga.create', 'keluarga.update', 'keluarga.delete',
            'lokasi.view', 'lokasi.create', 'lokasi.update', 'lokasi.delete',
            'pemateri.view', 'pemateri.create', 'pemateri.update', 'pemateri.delete',
            'materi.view', 'materi.create', 'materi.update', 'materi.delete',
            'kategori_kegiatan.view', 'kategori_kegiatan.create', 'kategori_kegiatan.update', 'kategori_kegiatan.delete',
            'lookup.view', 'lookup.create', 'lookup.update', 'lookup.delete',
            'kegiatan.view', 'kegiatan.create', 'kegiatan.update', 'kegiatan.delete',
            'absensi.view', 'absensi.create', 'absensi.execute',
            ...$feedbackUserCodes,
        ]);

        $admWilayahViewCodes = $this->withListUiChrome([
            'wilayah_adm_negara.view',
            'wilayah_adm_provinsi.view',
            'wilayah_adm_kabupaten_kota.view',
            'wilayah_adm_kecamatan.view',
            'wilayah_adm_desa.view',
            'wilayah_adm_kode_pos.view',
        ]);

        $adminPusatCodes = $this->withListUiChrome(array_merge($opsCodes, [
            'dapukan.view',
            'wilayah_fung_pusat.view',
            'wilayah_fung_daerah.view', 'wilayah_fung_daerah.create', 'wilayah_fung_daerah.update', 'wilayah_fung_daerah.delete',
            'wilayah_fung_desa.view', 'wilayah_fung_desa.create', 'wilayah_fung_desa.update', 'wilayah_fung_desa.delete',
            'wilayah_fung_kelompok.view', 'wilayah_fung_kelompok.create', 'wilayah_fung_kelompok.update', 'wilayah_fung_kelompok.delete',
            'wilayah_fung_sub_kelompok.view', 'wilayah_fung_sub_kelompok.create', 'wilayah_fung_sub_kelompok.update', 'wilayah_fung_sub_kelompok.delete',
            'users.view', 'users.create', 'users.update',
        ], $admWilayahViewCodes));

        $adminDaerahCodes = $this->withListUiChrome(array_merge($opsCodes, [
            'dapukan.view',
            'wilayah_fung_pusat.view',
            'wilayah_fung_daerah.view',
            'wilayah_fung_desa.view', 'wilayah_fung_desa.create', 'wilayah_fung_desa.update', 'wilayah_fung_desa.delete',
            'wilayah_fung_kelompok.view', 'wilayah_fung_kelompok.create', 'wilayah_fung_kelompok.update', 'wilayah_fung_kelompok.delete',
            'wilayah_fung_sub_kelompok.view', 'wilayah_fung_sub_kelompok.create', 'wilayah_fung_sub_kelompok.update', 'wilayah_fung_sub_kelompok.delete',
            'users.view', 'users.create', 'users.update',
        ], $admWilayahViewCodes));

        $adminDesaCodes = $this->withListUiChrome(array_merge($opsCodes, [
            'dapukan.view',
            'wilayah_fung_pusat.view',
            'wilayah_fung_daerah.view',
            'wilayah_fung_desa.view',
            'wilayah_fung_kelompok.view', 'wilayah_fung_kelompok.create', 'wilayah_fung_kelompok.update', 'wilayah_fung_kelompok.delete',
            'wilayah_fung_sub_kelompok.view', 'wilayah_fung_sub_kelompok.create', 'wilayah_fung_sub_kelompok.update', 'wilayah_fung_sub_kelompok.delete',
            'users.view', 'users.create', 'users.update',
        ], $admWilayahViewCodes));

        $adminKelompokCodes = $this->withListUiChrome(array_merge($opsCodes, [
            'dapukan.view',
            'wilayah_fung_pusat.view',
            'wilayah_fung_daerah.view',
            'wilayah_fung_desa.view',
            'wilayah_fung_kelompok.view',
            'wilayah_fung_sub_kelompok.view', 'wilayah_fung_sub_kelompok.create', 'wilayah_fung_sub_kelompok.update', 'wilayah_fung_sub_kelompok.delete',
        ], $admWilayahViewCodes));

        $opsViewCodes = $this->withListUiChrome([
            'dashboard.view',
            ...$dashboardWidgetCodes,
            'kehadiran.view',
            'kategori_umur.view',
            'kalender.view',
            ...$kalenderSectionCodes,
            'laporan_kehadiran.view',
            'laporan_jamaah.view',
            'laporan_kegiatan.view',
            'jamaah.view',
            'keluarga.view',
            'lokasi.view',
            'pemateri.view',
            'materi.view',
            'kategori_kegiatan.view',
            'lookup.view',
            'kegiatan.view',
            'absensi.view',
            'absensi.create',
            'absensi.execute',
            ...$feedbackUserCodes,
        ]);

        $jamaahKelompokCodes = $this->withListUiChrome([
            'dashboard.view',
            ...$dashboardWidgetCodes,
            'kehadiran.view',
            'kategori_umur.view',
            'kalender.view',
            ...$kalenderSectionCodes,
            'laporan_kehadiran.view',
            'laporan_kegiatan.view',
            'kegiatan.view',
            ...$feedbackUserCodes,
        ]);

        $dapukan['admin_pusat']->hakAkses()->sync($ids($adminPusatCodes));
        $dapukan['admin_daerah']->hakAkses()->sync($ids($adminDaerahCodes));
        $dapukan['admin_desa']->hakAkses()->sync($ids($adminDesaCodes));
        $dapukan['admin_kelompok']->hakAkses()->sync($ids($adminKelompokCodes));
        $dapukan['jamaah_kelompok']->hakAkses()->sync($ids($jamaahKelompokCodes));

        $opsViewIds = $ids($opsViewCodes);
        foreach ([
            'pnkb_daerah', 'pnkb_desa', 'pnkb_kelompok',
            '4s_daerah', '4s_desa', '4s_kelompok',
            'ku_daerah', 'ku_desa', 'ku_kelompok',
            'kmm_daerah', 'kmm_desa', 'kmm_kelompok',
            'pjp_daerah', 'pjp_desa', 'pjp_kelompok',
            'bk_daerah', 'bk_desa', 'bk_kelompok',
            'keputrian_daerah', 'keputrian_desa', 'keputrian_kelompok',
            'mubaligh_daerah', 'mubaligh_desa', 'mubaligh_kelompok',
            'faroid_daerah', 'faroid_desa', 'faroid_kelompok',
            'kematian_daerah', 'kematian_desa', 'kematian_kelompok',
        ] as $kode) {
            $dapukan[$kode]->hakAkses()->sync($opsViewIds);
        }
    }

    /**
     * Lampirkan izin print/export/kolom untuk setiap prefix yang sudah punya *.view di paket.
     *
     * @param  list<string>  $codes
     * @return list<string>
     */
    private function withListUiChrome(array $codes): array
    {
        $extra = [];
        foreach (array_keys($this->listUiChromeCatalog()) as $prefix) {
            $hasModuleAccess = in_array("{$prefix}.view", $codes, true)
                || collect($codes)->contains(fn (string $code) => str_starts_with($code, "{$prefix}."));
            if (! $hasModuleAccess) {
                continue;
            }
            $extra = array_merge($extra, $this->listUiChromePermissionCodes($prefix, $codes));
        }

        return array_values(array_unique(array_merge($codes, $extra)));
    }
}
