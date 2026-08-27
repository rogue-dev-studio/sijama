<?php

namespace Database\Seeders;

use App\Models\Dapukan;
use App\Models\Fitur;
use App\Models\HakAkses;
use App\Models\Menu;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        $dapukan = $this->seedDapukan();
        $this->purgeObsoleteDapukan($dapukan);
        $menus = $this->seedMenus();
        $fiturs = $this->seedFiturs($menus);
        $permissions = $this->seedHakAkses($fiturs);
        HakAkses::whereIn('slug', ['konfig.create', 'konfig.delete'])->delete();
        $this->assignPermissions($dapukan, $permissions);
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

                    if (Schema::hasTable('jamaah_dapukan')) {
                        $jamaahIds = DB::table('jamaah_dapukan')
                            ->where('dapukan_id', $legacy->id)
                            ->pluck('jamaah_id');

                        foreach ($jamaahIds as $jamaahId) {
                            $exists = DB::table('jamaah_dapukan')
                                ->where('jamaah_id', $jamaahId)
                                ->where('dapukan_id', $replacement->id)
                                ->exists();

                            if ($exists) {
                                DB::table('jamaah_dapukan')
                                    ->where('jamaah_id', $jamaahId)
                                    ->where('dapukan_id', $legacy->id)
                                    ->delete();
                            } else {
                                DB::table('jamaah_dapukan')
                                    ->where('jamaah_id', $jamaahId)
                                    ->where('dapukan_id', $legacy->id)
                                    ->update(['dapukan_id' => $replacement->id]);
                            }
                        }
                    }
                } else {
                    User::where('dapukan_id', $legacy->id)->update(['dapukan_id' => null]);
                    if (Schema::hasTable('jamaah_dapukan')) {
                        DB::table('jamaah_dapukan')->where('dapukan_id', $legacy->id)->delete();
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
            ['slug' => 'transaksi', 'nama' => 'Transaksi', 'path' => null, 'icon' => 'arrow-left-right', 'urutan' => 3, 'parent' => null],
            ['slug' => 'master', 'nama' => 'Master', 'path' => null, 'icon' => 'database', 'urutan' => 4, 'parent' => null],
            ['slug' => 'aplikasi', 'nama' => 'Aplikasi', 'path' => null, 'icon' => 'settings', 'urutan' => 5, 'parent' => null],

            ['slug' => 'dashboard', 'nama' => 'Dashboard', 'path' => '/', 'icon' => 'layout-dashboard', 'urutan' => 1, 'parent' => 'informasi'],
            ['slug' => 'kehadiran', 'nama' => 'Kehadiran', 'path' => '/kehadiran', 'icon' => 'clipboard-check', 'urutan' => 2, 'parent' => 'informasi'],
            ['slug' => 'kategori-umur', 'nama' => 'Kategori Umur', 'path' => '/kategori-umur', 'icon' => 'users', 'urutan' => 3, 'parent' => 'informasi'],
            ['slug' => 'kalender', 'nama' => 'Kalender', 'path' => '/kalender', 'icon' => 'calendar', 'urutan' => 4, 'parent' => 'informasi'],

            ['slug' => 'pengajian', 'nama' => 'Pengajian', 'path' => '/pengajian', 'icon' => 'book-open', 'urutan' => 1, 'parent' => 'transaksi'],
            ['slug' => 'kegiatan', 'nama' => 'Kegiatan', 'path' => '/kegiatan', 'icon' => 'calendar', 'urutan' => 2, 'parent' => 'transaksi'],
            ['slug' => 'absensi', 'nama' => 'Absensi', 'path' => '/absensi', 'icon' => 'scan-face', 'urutan' => 3, 'parent' => 'transaksi'],

            ['slug' => 'jamaah', 'nama' => 'Jamaah', 'path' => '/jamaah', 'icon' => 'users', 'urutan' => 1, 'parent' => 'master'],
            ['slug' => 'master-lokasi', 'nama' => 'Lokasi', 'path' => '/master/lokasi', 'icon' => 'map-pin', 'urutan' => 2, 'parent' => 'master'],
            ['slug' => 'master-pemateri', 'nama' => 'Pemateri', 'path' => '/master/pemateri', 'icon' => 'users', 'urutan' => 3, 'parent' => 'master'],
            ['slug' => 'master-materi', 'nama' => 'Materi', 'path' => '/master/materi', 'icon' => 'book-open', 'urutan' => 4, 'parent' => 'master'],
            ['slug' => 'master-kategori-kegiatan', 'nama' => 'Kategori Kegiatan', 'path' => '/master/kategori-kegiatan', 'icon' => 'calendar', 'urutan' => 5, 'parent' => 'master'],
            ['slug' => 'master-lookup', 'nama' => 'Lookup', 'path' => '/master/lookup', 'icon' => 'list', 'urutan' => 6, 'parent' => 'master'],
            ['slug' => 'wilayah', 'nama' => 'Wilayah Fungsional', 'path' => null, 'icon' => 'map', 'urutan' => 7, 'parent' => 'master'],
            ['slug' => 'master-pusat', 'nama' => 'Pusat', 'path' => '/master/pusat', 'icon' => 'building-2', 'urutan' => 1, 'parent' => 'wilayah'],
            ['slug' => 'master-daerah', 'nama' => 'Daerah', 'path' => '/master/daerah', 'icon' => 'map', 'urutan' => 2, 'parent' => 'wilayah'],
            ['slug' => 'master-desa', 'nama' => 'Desa', 'path' => '/master/desa', 'icon' => 'map-pin', 'urutan' => 3, 'parent' => 'wilayah'],
            ['slug' => 'master-kelompok', 'nama' => 'Kelompok', 'path' => '/master/kelompok', 'icon' => 'users-round', 'urutan' => 4, 'parent' => 'wilayah'],
            ['slug' => 'master-sub-kelompok', 'nama' => 'Sub Kelompok', 'path' => '/master/sub-kelompok', 'icon' => 'users', 'urutan' => 5, 'parent' => 'wilayah'],
            ['slug' => 'wilayah-admin', 'nama' => 'Wilayah Administrasi', 'path' => null, 'icon' => 'globe', 'urutan' => 9, 'parent' => 'master'],
            ['slug' => 'master-adm-negara', 'nama' => 'Negara', 'path' => '/master/adm/negara', 'icon' => 'flag', 'urutan' => 1, 'parent' => 'wilayah-admin'],
            ['slug' => 'master-adm-provinsi', 'nama' => 'Provinsi', 'path' => '/master/adm/provinsi', 'icon' => 'map', 'urutan' => 2, 'parent' => 'wilayah-admin'],
            ['slug' => 'master-adm-kabupaten-kota', 'nama' => 'Kabupaten/Kota', 'path' => '/master/adm/kabupaten-kota', 'icon' => 'building', 'urutan' => 3, 'parent' => 'wilayah-admin'],
            ['slug' => 'master-adm-kecamatan', 'nama' => 'Kecamatan', 'path' => '/master/adm/kecamatan', 'icon' => 'map-pin', 'urutan' => 4, 'parent' => 'wilayah-admin'],
            ['slug' => 'master-adm-desa-kelurahan', 'nama' => 'Desa/Kelurahan', 'path' => '/master/adm/desa-kelurahan', 'icon' => 'home', 'urutan' => 5, 'parent' => 'wilayah-admin'],
            ['slug' => 'master-adm-kode-pos', 'nama' => 'Kode Pos', 'path' => '/master/adm/kode-pos', 'icon' => 'mail', 'urutan' => 6, 'parent' => 'wilayah-admin'],
            ['slug' => 'master-dapukan', 'nama' => 'Dapukan', 'path' => '/master/dapukan', 'icon' => 'shield', 'urutan' => 10, 'parent' => 'master'],
            ['slug' => 'master-menu', 'nama' => 'Menu', 'path' => '/master/menu', 'icon' => 'menu', 'urutan' => 11, 'parent' => 'master'],
            ['slug' => 'master-fitur', 'nama' => 'Fitur', 'path' => '/master/fitur', 'icon' => 'puzzle', 'urutan' => 12, 'parent' => 'master'],
            ['slug' => 'master-hak-akses', 'nama' => 'Hak Akses', 'path' => '/master/hak-akses', 'icon' => 'key', 'urutan' => 13, 'parent' => 'master'],
            ['slug' => 'master-matriks', 'nama' => 'Matriks Akses', 'path' => '/master/matriks', 'icon' => 'grid-3x3', 'urutan' => 14, 'parent' => 'master'],
            ['slug' => 'master-users', 'nama' => 'Pengguna', 'path' => '/master/users', 'icon' => 'user-cog', 'urutan' => 15, 'parent' => 'master'],

            ['slug' => 'aplikasi-konfig', 'nama' => 'Konfigurasi Sistem', 'path' => '/aplikasi/konfig', 'icon' => 'settings', 'urutan' => 1, 'parent' => 'aplikasi'],
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
                    'is_active' => true,
                ]
            );
        }

        Menu::whereIn('slug', ['rbac', 'master-pekerjaan'])->update(['is_active' => false]);
        Fitur::where('slug', 'master-pekerjaan')->update(['is_active' => false]);

        return $result;
    }

    private function seedFiturs(array $menus): array
    {
        $leafMenus = [
            'dashboard',
            'kehadiran',
            'kategori-umur',
            'kalender',
            'jamaah',
            'master-lokasi',
            'master-pemateri',
            'master-materi',
            'master-kategori-kegiatan',
            'master-lookup',
            'pengajian',
            'kegiatan',
            'absensi',
            'master-dapukan',
            'master-menu',
            'master-fitur',
            'master-hak-akses',
            'master-matriks',
            'master-users',
            'master-pusat',
            'master-daerah',
            'master-desa',
            'master-kelompok',
            'master-sub-kelompok',
            'master-adm-negara',
            'master-adm-provinsi',
            'master-adm-kabupaten-kota',
            'master-adm-kecamatan',
            'master-adm-desa-kelurahan',
            'master-adm-kode-pos',
            'aplikasi-konfig',
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

        return $result;
    }

    private function seedHakAkses(array $fiturs): array
    {
        $definitions = [
            'dashboard' => [
                ['slug' => 'dashboard.view', 'nama' => 'Lihat Dashboard', 'aksi' => 'view'],
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
            'jamaah' => [
                ['slug' => 'jamaah.view', 'nama' => 'Lihat Jamaah', 'aksi' => 'view'],
                ['slug' => 'jamaah.create', 'nama' => 'Tambah Jamaah', 'aksi' => 'create'],
                ['slug' => 'jamaah.update', 'nama' => 'Ubah Jamaah', 'aksi' => 'update'],
                ['slug' => 'jamaah.delete', 'nama' => 'Hapus Jamaah', 'aksi' => 'delete'],
                ['slug' => 'jamaah.enroll_face', 'nama' => 'Enroll Wajah Jamaah', 'aksi' => 'execute'],
            ],
            'master-lokasi' => [
                ['slug' => 'lokasi.view', 'nama' => 'Lihat Lokasi', 'aksi' => 'view'],
                ['slug' => 'lokasi.create', 'nama' => 'Tambah Lokasi', 'aksi' => 'create'],
                ['slug' => 'lokasi.update', 'nama' => 'Ubah Lokasi', 'aksi' => 'update'],
                ['slug' => 'lokasi.delete', 'nama' => 'Hapus Lokasi', 'aksi' => 'delete'],
            ],
            'master-pemateri' => [
                ['slug' => 'pemateri.view', 'nama' => 'Lihat Pemateri', 'aksi' => 'view'],
                ['slug' => 'pemateri.create', 'nama' => 'Tambah Pemateri', 'aksi' => 'create'],
                ['slug' => 'pemateri.update', 'nama' => 'Ubah Pemateri', 'aksi' => 'update'],
                ['slug' => 'pemateri.delete', 'nama' => 'Hapus Pemateri', 'aksi' => 'delete'],
            ],
            'master-materi' => [
                ['slug' => 'materi.view', 'nama' => 'Lihat Materi', 'aksi' => 'view'],
                ['slug' => 'materi.create', 'nama' => 'Tambah Materi', 'aksi' => 'create'],
                ['slug' => 'materi.update', 'nama' => 'Ubah Materi', 'aksi' => 'update'],
                ['slug' => 'materi.delete', 'nama' => 'Hapus Materi', 'aksi' => 'delete'],
            ],
            'master-kategori-kegiatan' => [
                ['slug' => 'kategori_kegiatan.view', 'nama' => 'Lihat Kategori Kegiatan', 'aksi' => 'view'],
                ['slug' => 'kategori_kegiatan.create', 'nama' => 'Tambah Kategori Kegiatan', 'aksi' => 'create'],
                ['slug' => 'kategori_kegiatan.update', 'nama' => 'Ubah Kategori Kegiatan', 'aksi' => 'update'],
                ['slug' => 'kategori_kegiatan.delete', 'nama' => 'Hapus Kategori Kegiatan', 'aksi' => 'delete'],
            ],
            'master-lookup' => [
                ['slug' => 'lookup.view', 'nama' => 'Lihat Lookup', 'aksi' => 'view'],
                ['slug' => 'lookup.create', 'nama' => 'Tambah Lookup', 'aksi' => 'create'],
                ['slug' => 'lookup.update', 'nama' => 'Ubah Lookup', 'aksi' => 'update'],
                ['slug' => 'lookup.delete', 'nama' => 'Hapus Lookup', 'aksi' => 'delete'],
            ],
            'pengajian' => [
                ['slug' => 'pengajian.view', 'nama' => 'Lihat Pengajian', 'aksi' => 'view'],
                ['slug' => 'pengajian.create', 'nama' => 'Tambah Pengajian', 'aksi' => 'create'],
                ['slug' => 'pengajian.update', 'nama' => 'Ubah Pengajian', 'aksi' => 'update'],
                ['slug' => 'pengajian.delete', 'nama' => 'Hapus Pengajian', 'aksi' => 'delete'],
            ],
            'kegiatan' => [
                ['slug' => 'kegiatan.view', 'nama' => 'Lihat Kegiatan', 'aksi' => 'view'],
                ['slug' => 'kegiatan.create', 'nama' => 'Tambah Kegiatan', 'aksi' => 'create'],
                ['slug' => 'kegiatan.update', 'nama' => 'Ubah Kegiatan', 'aksi' => 'update'],
                ['slug' => 'kegiatan.delete', 'nama' => 'Hapus Kegiatan', 'aksi' => 'delete'],
            ],
            'absensi' => [
                ['slug' => 'absensi.view', 'nama' => 'Lihat Absensi', 'aksi' => 'view'],
                ['slug' => 'absensi.create', 'nama' => 'Kelola Sesi Absensi', 'aksi' => 'create'],
                ['slug' => 'absensi.execute', 'nama' => 'Check-in Absensi', 'aksi' => 'execute'],
            ],
            'master-dapukan' => [
                ['slug' => 'dapukan.view', 'nama' => 'Lihat Dapukan', 'aksi' => 'view'],
                ['slug' => 'dapukan.create', 'nama' => 'Tambah Dapukan', 'aksi' => 'create'],
                ['slug' => 'dapukan.update', 'nama' => 'Ubah Dapukan', 'aksi' => 'update'],
                ['slug' => 'dapukan.delete', 'nama' => 'Hapus Dapukan', 'aksi' => 'delete'],
            ],
            'master-menu' => [
                ['slug' => 'menu.view', 'nama' => 'Lihat Menu', 'aksi' => 'view'],
                ['slug' => 'menu.create', 'nama' => 'Tambah Menu', 'aksi' => 'create'],
                ['slug' => 'menu.update', 'nama' => 'Ubah Menu', 'aksi' => 'update'],
                ['slug' => 'menu.delete', 'nama' => 'Hapus Menu', 'aksi' => 'delete'],
            ],
            'master-fitur' => [
                ['slug' => 'fitur.view', 'nama' => 'Lihat Fitur', 'aksi' => 'view'],
                ['slug' => 'fitur.create', 'nama' => 'Tambah Fitur', 'aksi' => 'create'],
                ['slug' => 'fitur.update', 'nama' => 'Ubah Fitur', 'aksi' => 'update'],
                ['slug' => 'fitur.delete', 'nama' => 'Hapus Fitur', 'aksi' => 'delete'],
            ],
            'master-hak-akses' => [
                ['slug' => 'hak_akses.view', 'nama' => 'Lihat Hak Akses', 'aksi' => 'view'],
                ['slug' => 'hak_akses.create', 'nama' => 'Tambah Hak Akses', 'aksi' => 'create'],
                ['slug' => 'hak_akses.update', 'nama' => 'Ubah Hak Akses', 'aksi' => 'update'],
                ['slug' => 'hak_akses.delete', 'nama' => 'Hapus Hak Akses', 'aksi' => 'delete'],
            ],
            'master-matriks' => [
                ['slug' => 'matriks.view', 'nama' => 'Lihat Matriks Akses', 'aksi' => 'view'],
                ['slug' => 'matriks.update', 'nama' => 'Ubah Matriks Akses', 'aksi' => 'update'],
            ],
            'master-users' => [
                ['slug' => 'users.view', 'nama' => 'Lihat Pengguna', 'aksi' => 'view'],
                ['slug' => 'users.create', 'nama' => 'Tambah Pengguna', 'aksi' => 'create'],
                ['slug' => 'users.update', 'nama' => 'Ubah Pengguna', 'aksi' => 'update'],
                ['slug' => 'users.delete', 'nama' => 'Hapus Pengguna', 'aksi' => 'delete'],
            ],
            'master-pusat' => [
                ['slug' => 'pusat.view', 'nama' => 'Lihat Pusat', 'aksi' => 'view'],
                ['slug' => 'pusat.create', 'nama' => 'Tambah Pusat', 'aksi' => 'create'],
                ['slug' => 'pusat.update', 'nama' => 'Ubah Pusat', 'aksi' => 'update'],
                ['slug' => 'pusat.delete', 'nama' => 'Hapus Pusat', 'aksi' => 'delete'],
            ],
            'master-daerah' => [
                ['slug' => 'daerah.view', 'nama' => 'Lihat Daerah', 'aksi' => 'view'],
                ['slug' => 'daerah.create', 'nama' => 'Tambah Daerah', 'aksi' => 'create'],
                ['slug' => 'daerah.update', 'nama' => 'Ubah Daerah', 'aksi' => 'update'],
                ['slug' => 'daerah.delete', 'nama' => 'Hapus Daerah', 'aksi' => 'delete'],
            ],
            'master-desa' => [
                ['slug' => 'desa.view', 'nama' => 'Lihat Desa', 'aksi' => 'view'],
                ['slug' => 'desa.create', 'nama' => 'Tambah Desa', 'aksi' => 'create'],
                ['slug' => 'desa.update', 'nama' => 'Ubah Desa', 'aksi' => 'update'],
                ['slug' => 'desa.delete', 'nama' => 'Hapus Desa', 'aksi' => 'delete'],
            ],
            'master-kelompok' => [
                ['slug' => 'kelompok.view', 'nama' => 'Lihat Kelompok', 'aksi' => 'view'],
                ['slug' => 'kelompok.create', 'nama' => 'Tambah Kelompok', 'aksi' => 'create'],
                ['slug' => 'kelompok.update', 'nama' => 'Ubah Kelompok', 'aksi' => 'update'],
                ['slug' => 'kelompok.delete', 'nama' => 'Hapus Kelompok', 'aksi' => 'delete'],
            ],
            'master-sub-kelompok' => [
                ['slug' => 'sub_kelompok.view', 'nama' => 'Lihat Sub Kelompok', 'aksi' => 'view'],
                ['slug' => 'sub_kelompok.create', 'nama' => 'Tambah Sub Kelompok', 'aksi' => 'create'],
                ['slug' => 'sub_kelompok.update', 'nama' => 'Ubah Sub Kelompok', 'aksi' => 'update'],
                ['slug' => 'sub_kelompok.delete', 'nama' => 'Hapus Sub Kelompok', 'aksi' => 'delete'],
            ],
            'master-adm-negara' => [
                ['slug' => 'adm_negara.view', 'nama' => 'Lihat Negara', 'aksi' => 'view'],
                ['slug' => 'adm_negara.create', 'nama' => 'Tambah Negara', 'aksi' => 'create'],
                ['slug' => 'adm_negara.update', 'nama' => 'Ubah Negara', 'aksi' => 'update'],
                ['slug' => 'adm_negara.delete', 'nama' => 'Hapus Negara', 'aksi' => 'delete'],
            ],
            'master-adm-provinsi' => [
                ['slug' => 'adm_provinsi.view', 'nama' => 'Lihat Provinsi', 'aksi' => 'view'],
                ['slug' => 'adm_provinsi.create', 'nama' => 'Tambah Provinsi', 'aksi' => 'create'],
                ['slug' => 'adm_provinsi.update', 'nama' => 'Ubah Provinsi', 'aksi' => 'update'],
                ['slug' => 'adm_provinsi.delete', 'nama' => 'Hapus Provinsi', 'aksi' => 'delete'],
            ],
            'master-adm-kabupaten-kota' => [
                ['slug' => 'adm_kabupaten_kota.view', 'nama' => 'Lihat Kabupaten/Kota', 'aksi' => 'view'],
                ['slug' => 'adm_kabupaten_kota.create', 'nama' => 'Tambah Kabupaten/Kota', 'aksi' => 'create'],
                ['slug' => 'adm_kabupaten_kota.update', 'nama' => 'Ubah Kabupaten/Kota', 'aksi' => 'update'],
                ['slug' => 'adm_kabupaten_kota.delete', 'nama' => 'Hapus Kabupaten/Kota', 'aksi' => 'delete'],
            ],
            'master-adm-kecamatan' => [
                ['slug' => 'adm_kecamatan.view', 'nama' => 'Lihat Kecamatan', 'aksi' => 'view'],
                ['slug' => 'adm_kecamatan.create', 'nama' => 'Tambah Kecamatan', 'aksi' => 'create'],
                ['slug' => 'adm_kecamatan.update', 'nama' => 'Ubah Kecamatan', 'aksi' => 'update'],
                ['slug' => 'adm_kecamatan.delete', 'nama' => 'Hapus Kecamatan', 'aksi' => 'delete'],
            ],
            'master-adm-desa-kelurahan' => [
                ['slug' => 'adm_desa_kelurahan.view', 'nama' => 'Lihat Desa/Kelurahan', 'aksi' => 'view'],
                ['slug' => 'adm_desa_kelurahan.create', 'nama' => 'Tambah Desa/Kelurahan', 'aksi' => 'create'],
                ['slug' => 'adm_desa_kelurahan.update', 'nama' => 'Ubah Desa/Kelurahan', 'aksi' => 'update'],
                ['slug' => 'adm_desa_kelurahan.delete', 'nama' => 'Hapus Desa/Kelurahan', 'aksi' => 'delete'],
            ],
            'master-adm-kode-pos' => [
                ['slug' => 'adm_kode_pos.view', 'nama' => 'Lihat Kode Pos', 'aksi' => 'view'],
                ['slug' => 'adm_kode_pos.create', 'nama' => 'Tambah Kode Pos', 'aksi' => 'create'],
                ['slug' => 'adm_kode_pos.update', 'nama' => 'Ubah Kode Pos', 'aksi' => 'update'],
                ['slug' => 'adm_kode_pos.delete', 'nama' => 'Hapus Kode Pos', 'aksi' => 'delete'],
            ],
            'aplikasi-konfig' => [
                ['slug' => 'konfig.view', 'nama' => 'Lihat Konfigurasi Sistem', 'aksi' => 'view'],
                ['slug' => 'konfig.update', 'nama' => 'Ubah Konfigurasi Sistem', 'aksi' => 'update'],
            ],
        ];

        $result = [];

        foreach ($definitions as $fiturKode => $permissions) {
            $fitur = $fiturs[$fiturKode];

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
        $konfigSlugs = ['konfig.view', 'konfig.update'];
        $nonKonfigPermissions = collect($permissions)
            ->reject(fn ($permission, string $slug) => in_array($slug, $konfigSlugs, true));

        $allIds = $nonKonfigPermissions->pluck('id')->unique()->values()->all();
        $konfigIds = collect($konfigSlugs)
            ->map(fn (string $slug) => $permissions[$slug]->id ?? null)
            ->filter()
            ->values()
            ->all();

        $dapukan['superadmin']->hakAkses()->sync(array_values(array_unique(array_merge($allIds, $konfigIds))));

        $ids = fn (array $codes) => collect($codes)
            ->map(fn (string $kode) => $permissions[$kode]->id)
            ->unique()
            ->values()
            ->all();

        $opsCodes = [
            'dashboard.view',
            'kehadiran.view',
            'kategori_umur.view',
            'kalender.view',
            'jamaah.view', 'jamaah.create', 'jamaah.update', 'jamaah.delete', 'jamaah.enroll_face',
            'lokasi.view', 'lokasi.create', 'lokasi.update', 'lokasi.delete',
            'pemateri.view', 'pemateri.create', 'pemateri.update', 'pemateri.delete',
            'materi.view', 'materi.create', 'materi.update', 'materi.delete',
            'kategori_kegiatan.view', 'kategori_kegiatan.create', 'kategori_kegiatan.update', 'kategori_kegiatan.delete',
            'lookup.view', 'lookup.create', 'lookup.update', 'lookup.delete',
            'pengajian.view', 'pengajian.create', 'pengajian.update', 'pengajian.delete',
            'kegiatan.view', 'kegiatan.create', 'kegiatan.update', 'kegiatan.delete',
            'absensi.view', 'absensi.create', 'absensi.execute',
        ];

        $admWilayahViewCodes = [
            'adm_negara.view',
            'adm_provinsi.view',
            'adm_kabupaten_kota.view',
            'adm_kecamatan.view',
            'adm_desa_kelurahan.view',
            'adm_kode_pos.view',
        ];

        $adminPusatCodes = array_merge($opsCodes, [
            'dapukan.view',
            'pusat.view',
            'daerah.view', 'daerah.create', 'daerah.update', 'daerah.delete',
            'desa.view', 'desa.create', 'desa.update', 'desa.delete',
            'kelompok.view', 'kelompok.create', 'kelompok.update', 'kelompok.delete',
            'sub_kelompok.view', 'sub_kelompok.create', 'sub_kelompok.update', 'sub_kelompok.delete',
            'users.view', 'users.create', 'users.update',
        ], $admWilayahViewCodes);

        $adminDaerahCodes = array_merge($opsCodes, [
            'dapukan.view',
            'pusat.view',
            'daerah.view',
            'desa.view', 'desa.create', 'desa.update', 'desa.delete',
            'kelompok.view', 'kelompok.create', 'kelompok.update', 'kelompok.delete',
            'sub_kelompok.view', 'sub_kelompok.create', 'sub_kelompok.update', 'sub_kelompok.delete',
            'users.view', 'users.create', 'users.update',
        ], $admWilayahViewCodes);

        $adminDesaCodes = array_merge($opsCodes, [
            'dapukan.view',
            'pusat.view',
            'daerah.view',
            'desa.view',
            'kelompok.view', 'kelompok.create', 'kelompok.update', 'kelompok.delete',
            'sub_kelompok.view', 'sub_kelompok.create', 'sub_kelompok.update', 'sub_kelompok.delete',
            'users.view', 'users.create', 'users.update',
        ], $admWilayahViewCodes);

        $adminKelompokCodes = array_merge($opsCodes, [
            'dapukan.view',
            'pusat.view',
            'daerah.view',
            'desa.view',
            'kelompok.view',
            'sub_kelompok.view', 'sub_kelompok.create', 'sub_kelompok.update', 'sub_kelompok.delete',
        ], $admWilayahViewCodes);

        $opsViewCodes = [
            'dashboard.view',
            'kehadiran.view',
            'kategori_umur.view',
            'kalender.view',
            'jamaah.view',
            'lokasi.view',
            'pemateri.view',
            'materi.view',
            'kategori_kegiatan.view',
            'lookup.view',
            'pengajian.view',
            'kegiatan.view',
            'absensi.view',
            'absensi.create',
            'absensi.execute',
        ];

        $jamaahKelompokCodes = [
            'dashboard.view',
            'kehadiran.view',
            'kategori_umur.view',
            'kalender.view',
            'pengajian.view',
            'kegiatan.view',
        ];

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
}
