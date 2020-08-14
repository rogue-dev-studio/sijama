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
        $this->assignPermissions($dapukan, $permissions);
    }

    private function purgeObsoleteDapukan(array $active): void
    {
        $activeKodes = array_keys($active);
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
            ->whereNotIn('kode', $activeKodes)
            ->orderBy('id')
            ->each(function (Dapukan $legacy) use ($remap, $active) {
                $replacementKode = $remap[$legacy->kode] ?? null;
                $replacement = $replacementKode ? ($active[$replacementKode] ?? null) : null;

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
            ['kode' => 'superadmin', 'nama' => 'Super Admin', 'tingkat' => 'global', 'urutan' => 1],
            ['kode' => 'admin_pusat', 'nama' => 'Admin Pusat', 'tingkat' => 'pusat', 'urutan' => 2],
            ['kode' => 'admin_daerah', 'nama' => 'Admin Daerah', 'tingkat' => 'daerah', 'urutan' => 3],
            ['kode' => 'admin_desa', 'nama' => 'Admin Desa', 'tingkat' => 'desa', 'urutan' => 4],
            ['kode' => 'admin_kelompok', 'nama' => 'Admin Kelompok', 'tingkat' => 'kelompok', 'urutan' => 5],

            ['kode' => 'pnkb_daerah', 'nama' => 'PNKB Daerah', 'tingkat' => 'daerah', 'urutan' => 10, 'deskripsi' => 'Tim pernikahan daerah'],
            ['kode' => 'pnkb_desa', 'nama' => 'PNKB Desa', 'tingkat' => 'desa', 'urutan' => 11, 'deskripsi' => 'Tim pernikahan desa'],
            ['kode' => 'pnkb_kelompok', 'nama' => 'PNKB Kelompok', 'tingkat' => 'kelompok', 'urutan' => 12, 'deskripsi' => 'Tim pernikahan kelompok'],

            ['kode' => '4s_daerah', 'nama' => '4S Daerah', 'tingkat' => 'daerah', 'urutan' => 20],
            ['kode' => '4s_desa', 'nama' => '4S Desa', 'tingkat' => 'desa', 'urutan' => 21],
            ['kode' => '4s_kelompok', 'nama' => '4S Kelompok', 'tingkat' => 'kelompok', 'urutan' => 22],

            ['kode' => 'jamaah_kelompok', 'nama' => 'Jamaah Kelompok', 'tingkat' => 'kelompok', 'urutan' => 30],

            ['kode' => 'ku_daerah', 'nama' => 'KU Daerah', 'tingkat' => 'daerah', 'urutan' => 40, 'deskripsi' => 'Keuangan daerah'],
            ['kode' => 'ku_desa', 'nama' => 'KU Desa', 'tingkat' => 'desa', 'urutan' => 41, 'deskripsi' => 'Keuangan desa'],
            ['kode' => 'ku_kelompok', 'nama' => 'KU Kelompok', 'tingkat' => 'kelompok', 'urutan' => 42, 'deskripsi' => 'Keuangan kelompok'],

            ['kode' => 'kmm_daerah', 'nama' => 'KMM Daerah', 'tingkat' => 'daerah', 'urutan' => 50, 'deskripsi' => 'Ketua muda-mudi daerah'],
            ['kode' => 'kmm_desa', 'nama' => 'KMM Desa', 'tingkat' => 'desa', 'urutan' => 51, 'deskripsi' => 'Ketua muda-mudi desa'],
            ['kode' => 'kmm_kelompok', 'nama' => 'KMM Kelompok', 'tingkat' => 'kelompok', 'urutan' => 52, 'deskripsi' => 'Ketua muda-mudi kelompok'],

            ['kode' => 'pjp_daerah', 'nama' => 'PJP Daerah', 'tingkat' => 'daerah', 'urutan' => 60],
            ['kode' => 'pjp_desa', 'nama' => 'PJP Desa', 'tingkat' => 'desa', 'urutan' => 61],
            ['kode' => 'pjp_kelompok', 'nama' => 'PJP Kelompok', 'tingkat' => 'kelompok', 'urutan' => 62],

            ['kode' => 'bk_daerah', 'nama' => 'BK Daerah', 'tingkat' => 'daerah', 'urutan' => 70],
            ['kode' => 'bk_desa', 'nama' => 'BK Desa', 'tingkat' => 'desa', 'urutan' => 71],
            ['kode' => 'bk_kelompok', 'nama' => 'BK Kelompok', 'tingkat' => 'kelompok', 'urutan' => 72],

            ['kode' => 'keputrian_daerah', 'nama' => 'Keputrian Daerah', 'tingkat' => 'daerah', 'urutan' => 80],
            ['kode' => 'keputrian_desa', 'nama' => 'Keputrian Desa', 'tingkat' => 'desa', 'urutan' => 81],
            ['kode' => 'keputrian_kelompok', 'nama' => 'Keputrian Kelompok', 'tingkat' => 'kelompok', 'urutan' => 82],

            ['kode' => 'mubaligh_daerah', 'nama' => 'Mubaligh Daerah', 'tingkat' => 'daerah', 'urutan' => 90],
            ['kode' => 'mubaligh_desa', 'nama' => 'Mubaligh Desa', 'tingkat' => 'desa', 'urutan' => 91],
            ['kode' => 'mubaligh_kelompok', 'nama' => 'Mubaligh Kelompok', 'tingkat' => 'kelompok', 'urutan' => 92],

            ['kode' => 'faroid_daerah', 'nama' => 'Faroid Daerah', 'tingkat' => 'daerah', 'urutan' => 100],
            ['kode' => 'faroid_desa', 'nama' => 'Faroid Desa', 'tingkat' => 'desa', 'urutan' => 101],
            ['kode' => 'faroid_kelompok', 'nama' => 'Faroid Kelompok', 'tingkat' => 'kelompok', 'urutan' => 102],

            ['kode' => 'kematian_daerah', 'nama' => 'Kematian Daerah', 'tingkat' => 'daerah', 'urutan' => 110],
            ['kode' => 'kematian_desa', 'nama' => 'Kematian Desa', 'tingkat' => 'desa', 'urutan' => 111],
            ['kode' => 'kematian_kelompok', 'nama' => 'Kematian Kelompok', 'tingkat' => 'kelompok', 'urutan' => 112],
        ];

        $result = [];

        foreach ($definitions as $definition) {
            $result[$definition['kode']] = Dapukan::updateOrCreate(
                ['kode' => $definition['kode']],
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
            ['kode' => 'informasi', 'nama' => 'Informasi', 'path' => null, 'icon' => 'info', 'urutan' => 1, 'parent' => null],
            ['kode' => 'laporan', 'nama' => 'Laporan', 'path' => null, 'icon' => 'file-text', 'urutan' => 2, 'parent' => null],
            ['kode' => 'transaksi', 'nama' => 'Transaksi', 'path' => null, 'icon' => 'arrow-left-right', 'urutan' => 3, 'parent' => null],
            ['kode' => 'master', 'nama' => 'Master', 'path' => null, 'icon' => 'database', 'urutan' => 4, 'parent' => null],
            ['kode' => 'aplikasi', 'nama' => 'Aplikasi', 'path' => null, 'icon' => 'settings', 'urutan' => 5, 'parent' => null],

            ['kode' => 'dashboard', 'nama' => 'Dashboard', 'path' => '/', 'icon' => 'layout-dashboard', 'urutan' => 1, 'parent' => 'informasi'],
            ['kode' => 'kehadiran', 'nama' => 'Kehadiran', 'path' => '/kehadiran', 'icon' => 'clipboard-check', 'urutan' => 2, 'parent' => 'informasi'],
            ['kode' => 'kategori-umur', 'nama' => 'Kategori Umur', 'path' => '/kategori-umur', 'icon' => 'users', 'urutan' => 3, 'parent' => 'informasi'],
            ['kode' => 'kalender', 'nama' => 'Kalender', 'path' => '/kalender', 'icon' => 'calendar', 'urutan' => 4, 'parent' => 'informasi'],

            ['kode' => 'pengajian', 'nama' => 'Pengajian', 'path' => '/pengajian', 'icon' => 'book-open', 'urutan' => 1, 'parent' => 'transaksi'],
            ['kode' => 'kegiatan', 'nama' => 'Kegiatan', 'path' => '/kegiatan', 'icon' => 'calendar', 'urutan' => 2, 'parent' => 'transaksi'],
            ['kode' => 'absensi', 'nama' => 'Absensi', 'path' => '/absensi', 'icon' => 'scan-face', 'urutan' => 3, 'parent' => 'transaksi'],

            ['kode' => 'jamaah', 'nama' => 'Jamaah', 'path' => '/jamaah', 'icon' => 'users', 'urutan' => 1, 'parent' => 'master'],
            ['kode' => 'master-lokasi', 'nama' => 'Lokasi', 'path' => '/master/lokasi', 'icon' => 'map-pin', 'urutan' => 2, 'parent' => 'master'],
            ['kode' => 'master-pemateri', 'nama' => 'Pemateri', 'path' => '/master/pemateri', 'icon' => 'users', 'urutan' => 3, 'parent' => 'master'],
            ['kode' => 'master-materi', 'nama' => 'Materi', 'path' => '/master/materi', 'icon' => 'book-open', 'urutan' => 4, 'parent' => 'master'],
            ['kode' => 'master-kategori-kegiatan', 'nama' => 'Kategori Kegiatan', 'path' => '/master/kategori-kegiatan', 'icon' => 'calendar', 'urutan' => 5, 'parent' => 'master'],
            ['kode' => 'master-pekerjaan', 'nama' => 'Pekerjaan', 'path' => '/master/pekerjaan', 'icon' => 'briefcase', 'urutan' => 6, 'parent' => 'master'],
            ['kode' => 'wilayah', 'nama' => 'Wilayah Fungsional', 'path' => null, 'icon' => 'map', 'urutan' => 7, 'parent' => 'master'],
            ['kode' => 'master-pusat', 'nama' => 'Pusat', 'path' => '/master/pusat', 'icon' => 'building-2', 'urutan' => 1, 'parent' => 'wilayah'],
            ['kode' => 'master-daerah', 'nama' => 'Daerah', 'path' => '/master/daerah', 'icon' => 'map', 'urutan' => 2, 'parent' => 'wilayah'],
            ['kode' => 'master-desa', 'nama' => 'Desa', 'path' => '/master/desa', 'icon' => 'map-pin', 'urutan' => 3, 'parent' => 'wilayah'],
            ['kode' => 'master-kelompok', 'nama' => 'Kelompok', 'path' => '/master/kelompok', 'icon' => 'users-round', 'urutan' => 4, 'parent' => 'wilayah'],
            ['kode' => 'master-sub-kelompok', 'nama' => 'Sub Kelompok', 'path' => '/master/sub-kelompok', 'icon' => 'users', 'urutan' => 5, 'parent' => 'wilayah'],
            ['kode' => 'wilayah-admin', 'nama' => 'Wilayah Administrasi', 'path' => null, 'icon' => 'globe', 'urutan' => 8, 'parent' => 'master'],
            ['kode' => 'master-adm-negara', 'nama' => 'Negara', 'path' => '/master/adm/negara', 'icon' => 'flag', 'urutan' => 1, 'parent' => 'wilayah-admin'],
            ['kode' => 'master-adm-provinsi', 'nama' => 'Provinsi', 'path' => '/master/adm/provinsi', 'icon' => 'map', 'urutan' => 2, 'parent' => 'wilayah-admin'],
            ['kode' => 'master-adm-kabupaten-kota', 'nama' => 'Kabupaten/Kota', 'path' => '/master/adm/kabupaten-kota', 'icon' => 'building', 'urutan' => 3, 'parent' => 'wilayah-admin'],
            ['kode' => 'master-adm-kecamatan', 'nama' => 'Kecamatan', 'path' => '/master/adm/kecamatan', 'icon' => 'map-pin', 'urutan' => 4, 'parent' => 'wilayah-admin'],
            ['kode' => 'master-adm-desa-kelurahan', 'nama' => 'Desa/Kelurahan', 'path' => '/master/adm/desa-kelurahan', 'icon' => 'home', 'urutan' => 5, 'parent' => 'wilayah-admin'],
            ['kode' => 'master-adm-kode-pos', 'nama' => 'Kode Pos', 'path' => '/master/adm/kode-pos', 'icon' => 'mail', 'urutan' => 6, 'parent' => 'wilayah-admin'],

            ['kode' => 'master-dapukan', 'nama' => 'Dapukan', 'path' => '/master/dapukan', 'icon' => 'shield', 'urutan' => 1, 'parent' => 'aplikasi'],
            ['kode' => 'master-menu', 'nama' => 'Menu', 'path' => '/master/menu', 'icon' => 'menu', 'urutan' => 2, 'parent' => 'aplikasi'],
            ['kode' => 'master-fitur', 'nama' => 'Fitur', 'path' => '/master/fitur', 'icon' => 'puzzle', 'urutan' => 3, 'parent' => 'aplikasi'],
            ['kode' => 'master-hak-akses', 'nama' => 'Hak Akses', 'path' => '/master/hak-akses', 'icon' => 'key', 'urutan' => 4, 'parent' => 'aplikasi'],
            ['kode' => 'master-matriks', 'nama' => 'Matriks Akses', 'path' => '/master/matriks', 'icon' => 'grid-3x3', 'urutan' => 5, 'parent' => 'aplikasi'],
            ['kode' => 'master-users', 'nama' => 'Pengguna', 'path' => '/master/users', 'icon' => 'user-cog', 'urutan' => 6, 'parent' => 'aplikasi'],
        ];

        $result = [];

        foreach ($definitions as $definition) {
            $parentId = null;

            if ($definition['parent']) {
                $parentId = $result[$definition['parent']]->id;
            }

            $result[$definition['kode']] = Menu::updateOrCreate(
                ['kode' => $definition['kode']],
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

        Menu::whereIn('kode', ['rbac'])->update(['is_active' => false]);

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
            'master-pekerjaan',
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
        ];

        $result = [];

        foreach ($leafMenus as $menuKode) {
            $menu = $menus[$menuKode];

            $result[$menuKode] = Fitur::updateOrCreate(
                ['kode' => $menuKode],
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
                ['kode' => 'dashboard.view', 'nama' => 'Lihat Dashboard', 'aksi' => 'view'],
            ],
            'kehadiran' => [
                ['kode' => 'kehadiran.view', 'nama' => 'Lihat Daftar Kehadiran', 'aksi' => 'view'],
            ],
            'kategori-umur' => [
                ['kode' => 'kategori_umur.view', 'nama' => 'Lihat Kategori Umur', 'aksi' => 'view'],
            ],
            'kalender' => [
                ['kode' => 'kalender.view', 'nama' => 'Lihat Kalender', 'aksi' => 'view'],
            ],
            'jamaah' => [
                ['kode' => 'jamaah.view', 'nama' => 'Lihat Jamaah', 'aksi' => 'view'],
                ['kode' => 'jamaah.create', 'nama' => 'Tambah Jamaah', 'aksi' => 'create'],
                ['kode' => 'jamaah.update', 'nama' => 'Ubah Jamaah', 'aksi' => 'update'],
                ['kode' => 'jamaah.delete', 'nama' => 'Hapus Jamaah', 'aksi' => 'delete'],
                ['kode' => 'jamaah.enroll_face', 'nama' => 'Enroll Wajah Jamaah', 'aksi' => 'execute'],
            ],
            'master-lokasi' => [
                ['kode' => 'lokasi.view', 'nama' => 'Lihat Lokasi', 'aksi' => 'view'],
                ['kode' => 'lokasi.create', 'nama' => 'Tambah Lokasi', 'aksi' => 'create'],
                ['kode' => 'lokasi.update', 'nama' => 'Ubah Lokasi', 'aksi' => 'update'],
                ['kode' => 'lokasi.delete', 'nama' => 'Hapus Lokasi', 'aksi' => 'delete'],
            ],
            'master-pemateri' => [
                ['kode' => 'pemateri.view', 'nama' => 'Lihat Pemateri', 'aksi' => 'view'],
                ['kode' => 'pemateri.create', 'nama' => 'Tambah Pemateri', 'aksi' => 'create'],
                ['kode' => 'pemateri.update', 'nama' => 'Ubah Pemateri', 'aksi' => 'update'],
                ['kode' => 'pemateri.delete', 'nama' => 'Hapus Pemateri', 'aksi' => 'delete'],
            ],
            'master-materi' => [
                ['kode' => 'materi.view', 'nama' => 'Lihat Materi', 'aksi' => 'view'],
                ['kode' => 'materi.create', 'nama' => 'Tambah Materi', 'aksi' => 'create'],
                ['kode' => 'materi.update', 'nama' => 'Ubah Materi', 'aksi' => 'update'],
                ['kode' => 'materi.delete', 'nama' => 'Hapus Materi', 'aksi' => 'delete'],
            ],
            'master-kategori-kegiatan' => [
                ['kode' => 'kategori_kegiatan.view', 'nama' => 'Lihat Kategori Kegiatan', 'aksi' => 'view'],
                ['kode' => 'kategori_kegiatan.create', 'nama' => 'Tambah Kategori Kegiatan', 'aksi' => 'create'],
                ['kode' => 'kategori_kegiatan.update', 'nama' => 'Ubah Kategori Kegiatan', 'aksi' => 'update'],
                ['kode' => 'kategori_kegiatan.delete', 'nama' => 'Hapus Kategori Kegiatan', 'aksi' => 'delete'],
            ],
            'master-pekerjaan' => [
                ['kode' => 'pekerjaan.view', 'nama' => 'Lihat Pekerjaan', 'aksi' => 'view'],
                ['kode' => 'pekerjaan.create', 'nama' => 'Tambah Pekerjaan', 'aksi' => 'create'],
                ['kode' => 'pekerjaan.update', 'nama' => 'Ubah Pekerjaan', 'aksi' => 'update'],
                ['kode' => 'pekerjaan.delete', 'nama' => 'Hapus Pekerjaan', 'aksi' => 'delete'],
            ],
            'pengajian' => [
                ['kode' => 'pengajian.view', 'nama' => 'Lihat Pengajian', 'aksi' => 'view'],
                ['kode' => 'pengajian.create', 'nama' => 'Tambah Pengajian', 'aksi' => 'create'],
                ['kode' => 'pengajian.update', 'nama' => 'Ubah Pengajian', 'aksi' => 'update'],
                ['kode' => 'pengajian.delete', 'nama' => 'Hapus Pengajian', 'aksi' => 'delete'],
            ],
            'kegiatan' => [
                ['kode' => 'kegiatan.view', 'nama' => 'Lihat Kegiatan', 'aksi' => 'view'],
                ['kode' => 'kegiatan.create', 'nama' => 'Tambah Kegiatan', 'aksi' => 'create'],
                ['kode' => 'kegiatan.update', 'nama' => 'Ubah Kegiatan', 'aksi' => 'update'],
                ['kode' => 'kegiatan.delete', 'nama' => 'Hapus Kegiatan', 'aksi' => 'delete'],
            ],
            'absensi' => [
                ['kode' => 'absensi.view', 'nama' => 'Lihat Absensi', 'aksi' => 'view'],
                ['kode' => 'absensi.create', 'nama' => 'Kelola Sesi Absensi', 'aksi' => 'create'],
                ['kode' => 'absensi.execute', 'nama' => 'Check-in Absensi', 'aksi' => 'execute'],
            ],
            'master-dapukan' => [
                ['kode' => 'dapukan.view', 'nama' => 'Lihat Dapukan', 'aksi' => 'view'],
                ['kode' => 'dapukan.create', 'nama' => 'Tambah Dapukan', 'aksi' => 'create'],
                ['kode' => 'dapukan.update', 'nama' => 'Ubah Dapukan', 'aksi' => 'update'],
                ['kode' => 'dapukan.delete', 'nama' => 'Hapus Dapukan', 'aksi' => 'delete'],
            ],
            'master-menu' => [
                ['kode' => 'menu.view', 'nama' => 'Lihat Menu', 'aksi' => 'view'],
                ['kode' => 'menu.create', 'nama' => 'Tambah Menu', 'aksi' => 'create'],
                ['kode' => 'menu.update', 'nama' => 'Ubah Menu', 'aksi' => 'update'],
                ['kode' => 'menu.delete', 'nama' => 'Hapus Menu', 'aksi' => 'delete'],
            ],
            'master-fitur' => [
                ['kode' => 'fitur.view', 'nama' => 'Lihat Fitur', 'aksi' => 'view'],
                ['kode' => 'fitur.create', 'nama' => 'Tambah Fitur', 'aksi' => 'create'],
                ['kode' => 'fitur.update', 'nama' => 'Ubah Fitur', 'aksi' => 'update'],
                ['kode' => 'fitur.delete', 'nama' => 'Hapus Fitur', 'aksi' => 'delete'],
            ],
            'master-hak-akses' => [
                ['kode' => 'hak_akses.view', 'nama' => 'Lihat Hak Akses', 'aksi' => 'view'],
                ['kode' => 'hak_akses.create', 'nama' => 'Tambah Hak Akses', 'aksi' => 'create'],
                ['kode' => 'hak_akses.update', 'nama' => 'Ubah Hak Akses', 'aksi' => 'update'],
                ['kode' => 'hak_akses.delete', 'nama' => 'Hapus Hak Akses', 'aksi' => 'delete'],
            ],
            'master-matriks' => [
                ['kode' => 'matriks.view', 'nama' => 'Lihat Matriks Akses', 'aksi' => 'view'],
                ['kode' => 'matriks.update', 'nama' => 'Ubah Matriks Akses', 'aksi' => 'update'],
            ],
            'master-users' => [
                ['kode' => 'users.view', 'nama' => 'Lihat Pengguna', 'aksi' => 'view'],
                ['kode' => 'users.create', 'nama' => 'Tambah Pengguna', 'aksi' => 'create'],
                ['kode' => 'users.update', 'nama' => 'Ubah Pengguna', 'aksi' => 'update'],
                ['kode' => 'users.delete', 'nama' => 'Hapus Pengguna', 'aksi' => 'delete'],
            ],
            'master-pusat' => [
                ['kode' => 'pusat.view', 'nama' => 'Lihat Pusat', 'aksi' => 'view'],
                ['kode' => 'pusat.create', 'nama' => 'Tambah Pusat', 'aksi' => 'create'],
                ['kode' => 'pusat.update', 'nama' => 'Ubah Pusat', 'aksi' => 'update'],
                ['kode' => 'pusat.delete', 'nama' => 'Hapus Pusat', 'aksi' => 'delete'],
            ],
            'master-daerah' => [
                ['kode' => 'daerah.view', 'nama' => 'Lihat Daerah', 'aksi' => 'view'],
                ['kode' => 'daerah.create', 'nama' => 'Tambah Daerah', 'aksi' => 'create'],
                ['kode' => 'daerah.update', 'nama' => 'Ubah Daerah', 'aksi' => 'update'],
                ['kode' => 'daerah.delete', 'nama' => 'Hapus Daerah', 'aksi' => 'delete'],
            ],
            'master-desa' => [
                ['kode' => 'desa.view', 'nama' => 'Lihat Desa', 'aksi' => 'view'],
                ['kode' => 'desa.create', 'nama' => 'Tambah Desa', 'aksi' => 'create'],
                ['kode' => 'desa.update', 'nama' => 'Ubah Desa', 'aksi' => 'update'],
                ['kode' => 'desa.delete', 'nama' => 'Hapus Desa', 'aksi' => 'delete'],
            ],
            'master-kelompok' => [
                ['kode' => 'kelompok.view', 'nama' => 'Lihat Kelompok', 'aksi' => 'view'],
                ['kode' => 'kelompok.create', 'nama' => 'Tambah Kelompok', 'aksi' => 'create'],
                ['kode' => 'kelompok.update', 'nama' => 'Ubah Kelompok', 'aksi' => 'update'],
                ['kode' => 'kelompok.delete', 'nama' => 'Hapus Kelompok', 'aksi' => 'delete'],
            ],
            'master-sub-kelompok' => [
                ['kode' => 'sub_kelompok.view', 'nama' => 'Lihat Sub Kelompok', 'aksi' => 'view'],
                ['kode' => 'sub_kelompok.create', 'nama' => 'Tambah Sub Kelompok', 'aksi' => 'create'],
                ['kode' => 'sub_kelompok.update', 'nama' => 'Ubah Sub Kelompok', 'aksi' => 'update'],
                ['kode' => 'sub_kelompok.delete', 'nama' => 'Hapus Sub Kelompok', 'aksi' => 'delete'],
            ],
            'master-adm-negara' => [
                ['kode' => 'adm_negara.view', 'nama' => 'Lihat Negara', 'aksi' => 'view'],
                ['kode' => 'adm_negara.create', 'nama' => 'Tambah Negara', 'aksi' => 'create'],
                ['kode' => 'adm_negara.update', 'nama' => 'Ubah Negara', 'aksi' => 'update'],
                ['kode' => 'adm_negara.delete', 'nama' => 'Hapus Negara', 'aksi' => 'delete'],
            ],
            'master-adm-provinsi' => [
                ['kode' => 'adm_provinsi.view', 'nama' => 'Lihat Provinsi', 'aksi' => 'view'],
                ['kode' => 'adm_provinsi.create', 'nama' => 'Tambah Provinsi', 'aksi' => 'create'],
                ['kode' => 'adm_provinsi.update', 'nama' => 'Ubah Provinsi', 'aksi' => 'update'],
                ['kode' => 'adm_provinsi.delete', 'nama' => 'Hapus Provinsi', 'aksi' => 'delete'],
            ],
            'master-adm-kabupaten-kota' => [
                ['kode' => 'adm_kabupaten_kota.view', 'nama' => 'Lihat Kabupaten/Kota', 'aksi' => 'view'],
                ['kode' => 'adm_kabupaten_kota.create', 'nama' => 'Tambah Kabupaten/Kota', 'aksi' => 'create'],
                ['kode' => 'adm_kabupaten_kota.update', 'nama' => 'Ubah Kabupaten/Kota', 'aksi' => 'update'],
                ['kode' => 'adm_kabupaten_kota.delete', 'nama' => 'Hapus Kabupaten/Kota', 'aksi' => 'delete'],
            ],
            'master-adm-kecamatan' => [
                ['kode' => 'adm_kecamatan.view', 'nama' => 'Lihat Kecamatan', 'aksi' => 'view'],
                ['kode' => 'adm_kecamatan.create', 'nama' => 'Tambah Kecamatan', 'aksi' => 'create'],
                ['kode' => 'adm_kecamatan.update', 'nama' => 'Ubah Kecamatan', 'aksi' => 'update'],
                ['kode' => 'adm_kecamatan.delete', 'nama' => 'Hapus Kecamatan', 'aksi' => 'delete'],
            ],
            'master-adm-desa-kelurahan' => [
                ['kode' => 'adm_desa_kelurahan.view', 'nama' => 'Lihat Desa/Kelurahan', 'aksi' => 'view'],
                ['kode' => 'adm_desa_kelurahan.create', 'nama' => 'Tambah Desa/Kelurahan', 'aksi' => 'create'],
                ['kode' => 'adm_desa_kelurahan.update', 'nama' => 'Ubah Desa/Kelurahan', 'aksi' => 'update'],
                ['kode' => 'adm_desa_kelurahan.delete', 'nama' => 'Hapus Desa/Kelurahan', 'aksi' => 'delete'],
            ],
            'master-adm-kode-pos' => [
                ['kode' => 'adm_kode_pos.view', 'nama' => 'Lihat Kode Pos', 'aksi' => 'view'],
                ['kode' => 'adm_kode_pos.create', 'nama' => 'Tambah Kode Pos', 'aksi' => 'create'],
                ['kode' => 'adm_kode_pos.update', 'nama' => 'Ubah Kode Pos', 'aksi' => 'update'],
                ['kode' => 'adm_kode_pos.delete', 'nama' => 'Hapus Kode Pos', 'aksi' => 'delete'],
            ],
        ];

        $result = [];

        foreach ($definitions as $fiturKode => $permissions) {
            $fitur = $fiturs[$fiturKode];

            foreach ($permissions as $permission) {
                $result[$permission['kode']] = HakAkses::updateOrCreate(
                    ['kode' => $permission['kode']],
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
        $allIds = collect($permissions)->pluck('id')->unique()->values()->all();
        $dapukan['superadmin']->hakAkses()->sync($allIds);

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
            'pekerjaan.view', 'pekerjaan.create', 'pekerjaan.update', 'pekerjaan.delete',
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
            'pusat.view',
            'daerah.view', 'daerah.create', 'daerah.update', 'daerah.delete',
            'desa.view', 'desa.create', 'desa.update', 'desa.delete',
            'kelompok.view', 'kelompok.create', 'kelompok.update', 'kelompok.delete',
            'sub_kelompok.view', 'sub_kelompok.create', 'sub_kelompok.update', 'sub_kelompok.delete',
            'users.view', 'users.create', 'users.update',
        ], $admWilayahViewCodes);

        $adminDaerahCodes = array_merge($opsCodes, [
            'pusat.view',
            'daerah.view',
            'desa.view', 'desa.create', 'desa.update', 'desa.delete',
            'kelompok.view', 'kelompok.create', 'kelompok.update', 'kelompok.delete',
            'sub_kelompok.view', 'sub_kelompok.create', 'sub_kelompok.update', 'sub_kelompok.delete',
            'users.view', 'users.create', 'users.update',
        ]);

        $adminDesaCodes = array_merge($opsCodes, [
            'pusat.view',
            'daerah.view',
            'desa.view',
            'kelompok.view', 'kelompok.create', 'kelompok.update', 'kelompok.delete',
            'sub_kelompok.view', 'sub_kelompok.create', 'sub_kelompok.update', 'sub_kelompok.delete',
            'users.view', 'users.create', 'users.update',
        ]);

        $adminKelompokCodes = array_merge($opsCodes, [
            'pusat.view',
            'daerah.view',
            'desa.view',
            'kelompok.view',
            'sub_kelompok.view', 'sub_kelompok.create', 'sub_kelompok.update', 'sub_kelompok.delete',
        ]);

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
            'pekerjaan.view',
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
            'jamaah.view',
            'lokasi.view',
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
