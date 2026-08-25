<?php

use App\Http\Controllers\Api\AdmDesaKelurahanController;
use App\Http\Controllers\Api\AdmKabupatenKotaController;
use App\Http\Controllers\Api\AdmKecamatanController;
use App\Http\Controllers\Api\AdmKodePosController;
use App\Http\Controllers\Api\AdmNegaraController;
use App\Http\Controllers\Api\AdmProvinsiController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\DaerahController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DapukanController;
use App\Http\Controllers\Api\DebugFaceEnrollController;
use App\Http\Controllers\Api\DesaController;
use App\Http\Controllers\Api\FiturController;
use App\Http\Controllers\Api\HakAksesController;
use App\Http\Controllers\Api\JamaahController;
use App\Http\Controllers\Api\KategoriKegiatanController;
use App\Http\Controllers\Api\KategoriUmurController;
use App\Http\Controllers\Api\KelompokController;
use App\Http\Controllers\Api\KegiatanController;
use App\Http\Controllers\Api\LokasiController;
use App\Http\Controllers\Api\MasterUserController;
use App\Http\Controllers\Api\MateriController;
use App\Http\Controllers\Api\MatriksController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\PemateriController;
use App\Http\Controllers\Api\PekerjaanController;
use App\Http\Controllers\Api\PengajianController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PusatController;
use App\Http\Controllers\Api\SubKelompokController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::get('/profile/wilayah-options', [ProfileController::class, 'wilayahOptions']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::patch('/profile', [ProfileController::class, 'update']);

    if (config('app.debug')) {
        Route::post('debug/face-enroll', [DebugFaceEnrollController::class, 'store']);
        Route::get('debug/face-enroll', [DebugFaceEnrollController::class, 'index']);
    }

    Route::get('jamaah', [JamaahController::class, 'index'])->middleware('permission:jamaah.view');
    Route::get('jamaah/dapukan-options', [JamaahController::class, 'dapukanOptions'])->middleware('permission:jamaah.view');
    Route::get('jamaah/kelompok-options', [JamaahController::class, 'kelompokOptions'])->middleware('permission:jamaah.view');
    Route::post('jamaah', [JamaahController::class, 'store'])->middleware('permission:jamaah.create');
    Route::get('jamaah/{jamaah}', [JamaahController::class, 'show'])->middleware('permission:jamaah.view');
    Route::put('jamaah/{jamaah}', [JamaahController::class, 'update'])->middleware('permission:jamaah.update');
    Route::patch('jamaah/{jamaah}', [JamaahController::class, 'update'])->middleware('permission:jamaah.update');
    Route::delete('jamaah/{jamaah}', [JamaahController::class, 'destroy'])->middleware('permission:jamaah.delete');
    Route::post('jamaah/{jamaah}/face', [JamaahController::class, 'enrollFace'])->middleware('permission:jamaah.enroll_face');
    Route::delete('jamaah/{jamaah}/face', [JamaahController::class, 'resetFace'])->middleware('permission:jamaah.enroll_face');

    Route::get('pengajian', [PengajianController::class, 'index'])->middleware('permission:pengajian.view');
    Route::post('pengajian', [PengajianController::class, 'store'])->middleware('permission:pengajian.create');
    Route::get('pengajian/{pengajian}', [PengajianController::class, 'show'])->middleware('permission:pengajian.view');
    Route::put('pengajian/{pengajian}', [PengajianController::class, 'update'])->middleware('permission:pengajian.update');
    Route::patch('pengajian/{pengajian}', [PengajianController::class, 'update'])->middleware('permission:pengajian.update');
    Route::delete('pengajian/{pengajian}', [PengajianController::class, 'destroy'])->middleware('permission:pengajian.delete');

    Route::get('kegiatan', [KegiatanController::class, 'index'])->middleware('permission:kegiatan.view');
    Route::post('kegiatan', [KegiatanController::class, 'store'])->middleware('permission:kegiatan.create');
    Route::get('kegiatan/{kegiatan}', [KegiatanController::class, 'show'])->middleware('permission:kegiatan.view');
    Route::put('kegiatan/{kegiatan}', [KegiatanController::class, 'update'])->middleware('permission:kegiatan.update');
    Route::patch('kegiatan/{kegiatan}', [KegiatanController::class, 'update'])->middleware('permission:kegiatan.update');
    Route::delete('kegiatan/{kegiatan}', [KegiatanController::class, 'destroy'])->middleware('permission:kegiatan.delete');

    Route::prefix('attendance')->group(function () {
        Route::get('/sessions', [AttendanceController::class, 'listSessions'])->middleware('permission:absensi.view');
        Route::post('/sessions', [AttendanceController::class, 'openSession'])->middleware('permission:absensi.create');
        Route::get('/sessions/{session}', [AttendanceController::class, 'showSession'])->middleware('permission:absensi.view');
        Route::post('/sessions/{session}/close', [AttendanceController::class, 'closeSession'])->middleware('permission:absensi.create');
        Route::post('/sessions/{session}/check-in', [AttendanceController::class, 'checkIn'])->middleware('permission:absensi.execute');
    });

    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('permission:dashboard.view');
    Route::get('/dashboard/absensi-overview', [DashboardController::class, 'absensiOverview'])->middleware('permission:dashboard.view');
    Route::get('/kategori-umur', [KategoriUmurController::class, 'index'])->middleware('permission:kategori_umur.view');
    Route::get('/calendar', [CalendarController::class, 'index'])->middleware('permission:kalender.view');

    Route::prefix('master')->group(function () {
        Route::get('dapukan', [DapukanController::class, 'index'])->middleware('permission:dapukan.view');
        Route::post('dapukan', [DapukanController::class, 'store'])->middleware('permission:dapukan.create');
        Route::get('dapukan/{dapukan}', [DapukanController::class, 'show'])->middleware('permission:dapukan.view');
        Route::put('dapukan/{dapukan}', [DapukanController::class, 'update'])->middleware('permission:dapukan.update');
        Route::patch('dapukan/{dapukan}', [DapukanController::class, 'update'])->middleware('permission:dapukan.update');
        Route::delete('dapukan/{dapukan}', [DapukanController::class, 'destroy'])->middleware('permission:dapukan.delete');

        Route::get('menus', [MenuController::class, 'index'])->middleware('permission:menu.view');
        Route::post('menus', [MenuController::class, 'store'])->middleware('permission:menu.create');
        Route::get('menus/{menu}', [MenuController::class, 'show'])->middleware('permission:menu.view');
        Route::put('menus/{menu}', [MenuController::class, 'update'])->middleware('permission:menu.update');
        Route::patch('menus/{menu}', [MenuController::class, 'update'])->middleware('permission:menu.update');
        Route::delete('menus/{menu}', [MenuController::class, 'destroy'])->middleware('permission:menu.delete');

        Route::get('fiturs', [FiturController::class, 'index'])->middleware('permission:fitur.view');
        Route::post('fiturs', [FiturController::class, 'store'])->middleware('permission:fitur.create');
        Route::get('fiturs/{fitur}', [FiturController::class, 'show'])->middleware('permission:fitur.view');
        Route::put('fiturs/{fitur}', [FiturController::class, 'update'])->middleware('permission:fitur.update');
        Route::patch('fiturs/{fitur}', [FiturController::class, 'update'])->middleware('permission:fitur.update');
        Route::delete('fiturs/{fitur}', [FiturController::class, 'destroy'])->middleware('permission:fitur.delete');

        Route::get('hak-akses', [HakAksesController::class, 'index'])->middleware('permission:hak_akses.view');
        Route::post('hak-akses', [HakAksesController::class, 'store'])->middleware('permission:hak_akses.create');
        Route::get('hak-akses/{hak_akses}', [HakAksesController::class, 'show'])->middleware('permission:hak_akses.view');
        Route::put('hak-akses/{hak_akses}', [HakAksesController::class, 'update'])->middleware('permission:hak_akses.update');
        Route::patch('hak-akses/{hak_akses}', [HakAksesController::class, 'update'])->middleware('permission:hak_akses.update');
        Route::delete('hak-akses/{hak_akses}', [HakAksesController::class, 'destroy'])->middleware('permission:hak_akses.delete');

        Route::get('matriks', [MatriksController::class, 'index'])->middleware('permission:matriks.view');
        Route::put('matriks/{dapukan}', [MatriksController::class, 'update'])->middleware('permission:matriks.update');

        Route::get('users', [MasterUserController::class, 'index'])->middleware('permission:users.view');
        Route::post('users', [MasterUserController::class, 'store'])->middleware('permission:users.create');
        Route::get('users/{user}', [MasterUserController::class, 'show'])->middleware('permission:users.view');
        Route::put('users/{user}', [MasterUserController::class, 'update'])->middleware('permission:users.update');
        Route::patch('users/{user}', [MasterUserController::class, 'update'])->middleware('permission:users.update');
        Route::post('users/{user}/deactivate', [MasterUserController::class, 'deactivate'])->middleware('permission:users.update');

        Route::get('pusat', [PusatController::class, 'index'])->middleware('permission:pusat.view');
        Route::post('pusat', [PusatController::class, 'store'])->middleware('permission:pusat.create');
        Route::get('pusat/{pusat}', [PusatController::class, 'show'])->middleware('permission:pusat.view');
        Route::put('pusat/{pusat}', [PusatController::class, 'update'])->middleware('permission:pusat.update');
        Route::patch('pusat/{pusat}', [PusatController::class, 'update'])->middleware('permission:pusat.update');
        Route::delete('pusat/{pusat}', [PusatController::class, 'destroy'])->middleware('permission:pusat.delete');

        Route::get('daerah', [DaerahController::class, 'index'])->middleware('permission:daerah.view');
        Route::post('daerah', [DaerahController::class, 'store'])->middleware('permission:daerah.create');
        Route::get('daerah/{daerah}', [DaerahController::class, 'show'])->middleware('permission:daerah.view');
        Route::put('daerah/{daerah}', [DaerahController::class, 'update'])->middleware('permission:daerah.update');
        Route::patch('daerah/{daerah}', [DaerahController::class, 'update'])->middleware('permission:daerah.update');
        Route::delete('daerah/{daerah}', [DaerahController::class, 'destroy'])->middleware('permission:daerah.delete');

        Route::get('desa', [DesaController::class, 'index'])->middleware('permission:desa.view');
        Route::post('desa', [DesaController::class, 'store'])->middleware('permission:desa.create');
        Route::get('desa/{desa}', [DesaController::class, 'show'])->middleware('permission:desa.view');
        Route::put('desa/{desa}', [DesaController::class, 'update'])->middleware('permission:desa.update');
        Route::patch('desa/{desa}', [DesaController::class, 'update'])->middleware('permission:desa.update');
        Route::delete('desa/{desa}', [DesaController::class, 'destroy'])->middleware('permission:desa.delete');

        Route::get('kelompok', [KelompokController::class, 'index'])->middleware('permission:kelompok.view');
        Route::post('kelompok', [KelompokController::class, 'store'])->middleware('permission:kelompok.create');
        Route::get('kelompok/{kelompok}', [KelompokController::class, 'show'])->middleware('permission:kelompok.view');
        Route::put('kelompok/{kelompok}', [KelompokController::class, 'update'])->middleware('permission:kelompok.update');
        Route::patch('kelompok/{kelompok}', [KelompokController::class, 'update'])->middleware('permission:kelompok.update');
        Route::delete('kelompok/{kelompok}', [KelompokController::class, 'destroy'])->middleware('permission:kelompok.delete');

        Route::get('sub-kelompok', [SubKelompokController::class, 'index'])->middleware('permission:sub_kelompok.view');
        Route::post('sub-kelompok', [SubKelompokController::class, 'store'])->middleware('permission:sub_kelompok.create');
        Route::get('sub-kelompok/{sub_kelompok}', [SubKelompokController::class, 'show'])->middleware('permission:sub_kelompok.view');
        Route::put('sub-kelompok/{sub_kelompok}', [SubKelompokController::class, 'update'])->middleware('permission:sub_kelompok.update');
        Route::patch('sub-kelompok/{sub_kelompok}', [SubKelompokController::class, 'update'])->middleware('permission:sub_kelompok.update');
        Route::delete('sub-kelompok/{sub_kelompok}', [SubKelompokController::class, 'destroy'])->middleware('permission:sub_kelompok.delete');

        Route::get('lokasi', [LokasiController::class, 'index'])->middleware('permission:lokasi.view');
        Route::post('lokasi/resolve-location', [LokasiController::class, 'resolveLocation'])
            ->middleware('permission:lokasi.view');
        Route::get('lokasi/search-places', [LokasiController::class, 'searchPlaces'])
            ->middleware('permission:lokasi.view');
        Route::post('lokasi', [LokasiController::class, 'store'])->middleware('permission:lokasi.create');
        Route::get('lokasi/{lokasi}', [LokasiController::class, 'show'])->middleware('permission:lokasi.view');
        Route::put('lokasi/{lokasi}', [LokasiController::class, 'update'])->middleware('permission:lokasi.update');
        Route::patch('lokasi/{lokasi}', [LokasiController::class, 'update'])->middleware('permission:lokasi.update');
        Route::delete('lokasi/{lokasi}', [LokasiController::class, 'destroy'])->middleware('permission:lokasi.delete');

        Route::get('pemateri', [PemateriController::class, 'index'])->middleware('permission:pemateri.view');
        Route::post('pemateri', [PemateriController::class, 'store'])->middleware('permission:pemateri.create');
        Route::get('pemateri/{pemateri}', [PemateriController::class, 'show'])->middleware('permission:pemateri.view');
        Route::put('pemateri/{pemateri}', [PemateriController::class, 'update'])->middleware('permission:pemateri.update');
        Route::patch('pemateri/{pemateri}', [PemateriController::class, 'update'])->middleware('permission:pemateri.update');
        Route::delete('pemateri/{pemateri}', [PemateriController::class, 'destroy'])->middleware('permission:pemateri.delete');

        Route::get('pekerjaan', [PekerjaanController::class, 'index'])->middleware('permission:pekerjaan.view');
        Route::post('pekerjaan', [PekerjaanController::class, 'store'])->middleware('permission:pekerjaan.create');
        Route::get('pekerjaan/{pekerjaan}', [PekerjaanController::class, 'show'])->middleware('permission:pekerjaan.view');
        Route::put('pekerjaan/{pekerjaan}', [PekerjaanController::class, 'update'])->middleware('permission:pekerjaan.update');
        Route::patch('pekerjaan/{pekerjaan}', [PekerjaanController::class, 'update'])->middleware('permission:pekerjaan.update');
        Route::delete('pekerjaan/{pekerjaan}', [PekerjaanController::class, 'destroy'])->middleware('permission:pekerjaan.delete');

        Route::get('materi', [MateriController::class, 'index'])->middleware('permission:materi.view');
        Route::post('materi', [MateriController::class, 'store'])->middleware('permission:materi.create');
        Route::get('materi/{materi}', [MateriController::class, 'show'])->middleware('permission:materi.view');
        Route::put('materi/{materi}', [MateriController::class, 'update'])->middleware('permission:materi.update');
        Route::patch('materi/{materi}', [MateriController::class, 'update'])->middleware('permission:materi.update');
        Route::delete('materi/{materi}', [MateriController::class, 'destroy'])->middleware('permission:materi.delete');

        Route::get('kategori-kegiatan', [KategoriKegiatanController::class, 'index'])->middleware('permission:kategori_kegiatan.view');
        Route::post('kategori-kegiatan', [KategoriKegiatanController::class, 'store'])->middleware('permission:kategori_kegiatan.create');
        Route::get('kategori-kegiatan/{kategori_kegiatan}', [KategoriKegiatanController::class, 'show'])->middleware('permission:kategori_kegiatan.view');
        Route::put('kategori-kegiatan/{kategori_kegiatan}', [KategoriKegiatanController::class, 'update'])->middleware('permission:kategori_kegiatan.update');
        Route::patch('kategori-kegiatan/{kategori_kegiatan}', [KategoriKegiatanController::class, 'update'])->middleware('permission:kategori_kegiatan.update');
        Route::delete('kategori-kegiatan/{kategori_kegiatan}', [KategoriKegiatanController::class, 'destroy'])->middleware('permission:kategori_kegiatan.delete');

        Route::prefix('adm')->group(function () {
            Route::get('negara', [AdmNegaraController::class, 'index'])->middleware('permission:adm_negara.view');
            Route::post('negara', [AdmNegaraController::class, 'store'])->middleware('permission:adm_negara.create');
            Route::get('negara/{adm_negara}', [AdmNegaraController::class, 'show'])->middleware('permission:adm_negara.view');
            Route::put('negara/{adm_negara}', [AdmNegaraController::class, 'update'])->middleware('permission:adm_negara.update');
            Route::patch('negara/{adm_negara}', [AdmNegaraController::class, 'update'])->middleware('permission:adm_negara.update');
            Route::delete('negara/{adm_negara}', [AdmNegaraController::class, 'destroy'])->middleware('permission:adm_negara.delete');

            Route::get('provinsi', [AdmProvinsiController::class, 'index'])->middleware('permission:adm_provinsi.view');
            Route::post('provinsi', [AdmProvinsiController::class, 'store'])->middleware('permission:adm_provinsi.create');
            Route::get('provinsi/{adm_provinsi}', [AdmProvinsiController::class, 'show'])->middleware('permission:adm_provinsi.view');
            Route::put('provinsi/{adm_provinsi}', [AdmProvinsiController::class, 'update'])->middleware('permission:adm_provinsi.update');
            Route::patch('provinsi/{adm_provinsi}', [AdmProvinsiController::class, 'update'])->middleware('permission:adm_provinsi.update');
            Route::delete('provinsi/{adm_provinsi}', [AdmProvinsiController::class, 'destroy'])->middleware('permission:adm_provinsi.delete');

            Route::get('kabupaten-kota', [AdmKabupatenKotaController::class, 'index'])->middleware('permission:adm_kabupaten_kota.view');
            Route::post('kabupaten-kota', [AdmKabupatenKotaController::class, 'store'])->middleware('permission:adm_kabupaten_kota.create');
            Route::get('kabupaten-kota/{adm_kabupaten_kota}', [AdmKabupatenKotaController::class, 'show'])->middleware('permission:adm_kabupaten_kota.view');
            Route::put('kabupaten-kota/{adm_kabupaten_kota}', [AdmKabupatenKotaController::class, 'update'])->middleware('permission:adm_kabupaten_kota.update');
            Route::patch('kabupaten-kota/{adm_kabupaten_kota}', [AdmKabupatenKotaController::class, 'update'])->middleware('permission:adm_kabupaten_kota.update');
            Route::delete('kabupaten-kota/{adm_kabupaten_kota}', [AdmKabupatenKotaController::class, 'destroy'])->middleware('permission:adm_kabupaten_kota.delete');

            Route::get('kecamatan', [AdmKecamatanController::class, 'index'])->middleware('permission:adm_kecamatan.view');
            Route::post('kecamatan', [AdmKecamatanController::class, 'store'])->middleware('permission:adm_kecamatan.create');
            Route::get('kecamatan/{adm_kecamatan}', [AdmKecamatanController::class, 'show'])->middleware('permission:adm_kecamatan.view');
            Route::put('kecamatan/{adm_kecamatan}', [AdmKecamatanController::class, 'update'])->middleware('permission:adm_kecamatan.update');
            Route::patch('kecamatan/{adm_kecamatan}', [AdmKecamatanController::class, 'update'])->middleware('permission:adm_kecamatan.update');
            Route::delete('kecamatan/{adm_kecamatan}', [AdmKecamatanController::class, 'destroy'])->middleware('permission:adm_kecamatan.delete');

            Route::get('desa-kelurahan', [AdmDesaKelurahanController::class, 'index'])->middleware('permission:adm_desa_kelurahan.view');
            Route::post('desa-kelurahan', [AdmDesaKelurahanController::class, 'store'])->middleware('permission:adm_desa_kelurahan.create');
            Route::get('desa-kelurahan/{adm_desa_kelurahan}', [AdmDesaKelurahanController::class, 'show'])->middleware('permission:adm_desa_kelurahan.view');
            Route::put('desa-kelurahan/{adm_desa_kelurahan}', [AdmDesaKelurahanController::class, 'update'])->middleware('permission:adm_desa_kelurahan.update');
            Route::patch('desa-kelurahan/{adm_desa_kelurahan}', [AdmDesaKelurahanController::class, 'update'])->middleware('permission:adm_desa_kelurahan.update');
            Route::delete('desa-kelurahan/{adm_desa_kelurahan}', [AdmDesaKelurahanController::class, 'destroy'])->middleware('permission:adm_desa_kelurahan.delete');

            Route::get('kode-pos', [AdmKodePosController::class, 'index'])->middleware('permission:adm_kode_pos.view');
            Route::post('kode-pos', [AdmKodePosController::class, 'store'])->middleware('permission:adm_kode_pos.create');
            Route::get('kode-pos/{adm_kode_pos}', [AdmKodePosController::class, 'show'])->middleware('permission:adm_kode_pos.view');
            Route::put('kode-pos/{adm_kode_pos}', [AdmKodePosController::class, 'update'])->middleware('permission:adm_kode_pos.update');
            Route::patch('kode-pos/{adm_kode_pos}', [AdmKodePosController::class, 'update'])->middleware('permission:adm_kode_pos.update');
            Route::delete('kode-pos/{adm_kode_pos}', [AdmKodePosController::class, 'destroy'])->middleware('permission:adm_kode_pos.delete');
        });
    });
});
