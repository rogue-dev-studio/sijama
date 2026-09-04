<?php

use App\Http\Controllers\Api\AdmDesaKelurahanController;
use App\Http\Controllers\Api\AdmKabupatenKotaController;
use App\Http\Controllers\Api\AdmKecamatanController;
use App\Http\Controllers\Api\AdmKodePosController;
use App\Http\Controllers\Api\AdmNegaraController;
use App\Http\Controllers\Api\AdmProvinsiController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuditActivityController;
use App\Http\Controllers\Api\AuditLoginController;
use App\Http\Controllers\Api\AppErrorLogController;
use App\Http\Controllers\Api\AppFeedbackController;
use App\Http\Controllers\Api\AppReportController;
use App\Http\Controllers\Api\IntegrationLogController;
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
use App\Http\Controllers\Api\KeluargaController;
use App\Http\Controllers\Api\KelompokController;
use App\Http\Controllers\Api\KegiatanController;
use App\Http\Controllers\Api\KegiatanJadwalRutinController;
use App\Http\Controllers\Api\KonfigDokumenKController;
use App\Http\Controllers\Api\KonfigSystemKController;
use App\Http\Controllers\Api\LaporanController;
use App\Http\Controllers\Api\LokasiController;
use App\Http\Controllers\Api\LookupMController;
use App\Http\Controllers\Api\LookupOptionsController;
use App\Http\Controllers\Api\MasterUserController;
use App\Http\Controllers\Api\MateriController;
use App\Http\Controllers\Api\MatriksController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\PemateriController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProtectedMediaController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PusatController;
use App\Http\Controllers\Api\ShareExportController;
use App\Http\Controllers\Api\SubKelompokController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'store'])->middleware('throttle:6,1');
Route::post('/reset-password', [PasswordResetController::class, 'update'])->middleware('throttle:10,1');
Route::get('/public/konfig', [KonfigSystemKController::class, 'publicShow']);

Route::middleware(['auth:sanctum', 'maintenance.access'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/media/{path}', [ProtectedMediaController::class, 'show'])
        ->where('path', '.*');
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::get('/profile/wilayah-options', [ProfileController::class, 'wilayahOptions']);
    Route::get('/profile/wilayah-from-nik', [ProfileController::class, 'wilayahFromNik']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::patch('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::put('/profile/login-session', [ProfileController::class, 'updateLoginSession']);
    Route::patch('/profile/login-session', [ProfileController::class, 'updateLoginSession']);
    Route::post('/profile/photo', [ProfileController::class, 'uploadPhoto']);
    Route::delete('/profile/photo', [ProfileController::class, 'deletePhoto']);
    Route::post('/profile/signature', [ProfileController::class, 'uploadSignature']);
    Route::delete('/profile/signature', [ProfileController::class, 'deleteSignature']);
    Route::post('/share/exports', [ShareExportController::class, 'store']);
    Route::get('/lookups/options', LookupOptionsController::class);

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

    Route::get('keluarga/jamaah-options', [KeluargaController::class, 'jamaahOptions'])->middleware('permission:keluarga.view');
    Route::get('keluarga', [KeluargaController::class, 'index'])->middleware('permission:keluarga.view');
    Route::post('keluarga', [KeluargaController::class, 'store'])->middleware('permission:keluarga.create');
    Route::get('keluarga/{keluarga}', [KeluargaController::class, 'show'])->middleware('permission:keluarga.view');
    Route::put('keluarga/{keluarga}', [KeluargaController::class, 'update'])->middleware('permission:keluarga.update');
    Route::patch('keluarga/{keluarga}', [KeluargaController::class, 'update'])->middleware('permission:keluarga.update');
    Route::delete('keluarga/{keluarga}', [KeluargaController::class, 'destroy'])->middleware('permission:keluarga.delete');


    Route::get('kegiatan', [KegiatanController::class, 'index'])->middleware('permission:kegiatan.view');
    Route::post('kegiatan', [KegiatanController::class, 'store'])->middleware('permission:kegiatan.create');
    Route::get('kegiatan/{kegiatan}', [KegiatanController::class, 'show'])->middleware('permission:kegiatan.view');
    Route::put('kegiatan/{kegiatan}', [KegiatanController::class, 'update'])->middleware('permission:kegiatan.update');
    Route::patch('kegiatan/{kegiatan}', [KegiatanController::class, 'update'])->middleware('permission:kegiatan.update');
    Route::delete('kegiatan/{kegiatan}', [KegiatanController::class, 'destroy'])->middleware('permission:kegiatan.delete');

    Route::get('kegiatan-jadwal-rutin', [KegiatanJadwalRutinController::class, 'index'])->middleware('permission:kegiatan.view');
    Route::post('kegiatan-jadwal-rutin', [KegiatanJadwalRutinController::class, 'store'])->middleware('permission:kegiatan.create');
    Route::get('kegiatan-jadwal-rutin/{jadwal}', [KegiatanJadwalRutinController::class, 'show'])->middleware('permission:kegiatan.view');
    Route::put('kegiatan-jadwal-rutin/{jadwal}', [KegiatanJadwalRutinController::class, 'update'])->middleware('permission:kegiatan.update');
    Route::patch('kegiatan-jadwal-rutin/{jadwal}', [KegiatanJadwalRutinController::class, 'update'])->middleware('permission:kegiatan.update');
    Route::post('kegiatan-jadwal-rutin/{jadwal}/deactivate', [KegiatanJadwalRutinController::class, 'deactivate'])->middleware('permission:kegiatan.update');
    Route::post('kegiatan-jadwal-rutin/{jadwal}/generate', [KegiatanJadwalRutinController::class, 'generate'])->middleware('permission:kegiatan.create');

    Route::prefix('attendance')->group(function () {
        Route::get('/sessions', [AttendanceController::class, 'listSessions'])->middleware('permission:absensi.view');
        Route::post('/sessions', [AttendanceController::class, 'openSession'])->middleware('permission:absensi.create');
        Route::get('/sessions/{session}', [AttendanceController::class, 'showSession'])->middleware('permission:absensi.view');
        Route::post('/sessions/{session}/close', [AttendanceController::class, 'closeSession'])->middleware('permission:absensi.create');
        Route::post('/sessions/{session}/check-in', [AttendanceController::class, 'checkIn'])->middleware('permission:absensi.execute');
    });

    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('permission:dashboard.view');
    Route::get('/dashboard/absensi-overview', [DashboardController::class, 'absensiOverview'])
        ->middleware('permission:dashboard.absensi_overview.view');
    Route::get('/kategori-umur', [KategoriUmurController::class, 'index'])->middleware('permission:kategori_umur.view');
    Route::get('/calendar', [CalendarController::class, 'index'])->middleware('permission:kalender.view');

    Route::prefix('laporan')->group(function () {
        Route::get('kehadiran', [LaporanController::class, 'kehadiran'])->middleware('permission:laporan_kehadiran.view');
        Route::get('jamaah', [LaporanController::class, 'jamaah'])->middleware('permission:laporan_jamaah.view');
        Route::get('kegiatan', [LaporanController::class, 'kegiatan'])->middleware('permission:laporan_kegiatan.view');
    });

    Route::prefix('master')->group(function () {
        Route::get('dapukan', [DapukanController::class, 'index'])->middleware('permission:dapukan.view');
        Route::get('dapukan/{dapukan}', [DapukanController::class, 'show'])->middleware('permission:dapukan.view');

        Route::middleware('superadmin')->group(function () {
            Route::post('dapukan', [DapukanController::class, 'store'])->middleware('permission:dapukan.create');
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
        });

        Route::get('users', [MasterUserController::class, 'index'])->middleware('permission:users.view');
        Route::post('users', [MasterUserController::class, 'store'])->middleware('permission:users.create');
        Route::get('users/{user}', [MasterUserController::class, 'show'])->middleware('permission:users.view');
        Route::put('users/{user}', [MasterUserController::class, 'update'])->middleware('permission:users.update');
        Route::patch('users/{user}', [MasterUserController::class, 'update'])->middleware('permission:users.update');
        Route::post('users/{user}/deactivate', [MasterUserController::class, 'deactivate'])->middleware('permission:users.update');

        Route::prefix('wilayah-fung')->group(function () {
            Route::get('pusat', [PusatController::class, 'index'])->middleware('permission:wilayah_fung_pusat.view');
            Route::post('pusat', [PusatController::class, 'store'])->middleware('permission:wilayah_fung_pusat.create');
            Route::get('pusat/{wilayah_fung_pusat}', [PusatController::class, 'show'])->middleware('permission:wilayah_fung_pusat.view');
            Route::put('pusat/{wilayah_fung_pusat}', [PusatController::class, 'update'])->middleware('permission:wilayah_fung_pusat.update');
            Route::patch('pusat/{wilayah_fung_pusat}', [PusatController::class, 'update'])->middleware('permission:wilayah_fung_pusat.update');
            Route::delete('pusat/{wilayah_fung_pusat}', [PusatController::class, 'destroy'])->middleware('permission:wilayah_fung_pusat.delete');

            Route::get('daerah', [DaerahController::class, 'index'])->middleware('permission:wilayah_fung_daerah.view');
            Route::post('daerah', [DaerahController::class, 'store'])->middleware('permission:wilayah_fung_daerah.create');
            Route::get('daerah/{wilayah_fung_daerah}', [DaerahController::class, 'show'])->middleware('permission:wilayah_fung_daerah.view');
            Route::put('daerah/{wilayah_fung_daerah}', [DaerahController::class, 'update'])->middleware('permission:wilayah_fung_daerah.update');
            Route::patch('daerah/{wilayah_fung_daerah}', [DaerahController::class, 'update'])->middleware('permission:wilayah_fung_daerah.update');
            Route::delete('daerah/{wilayah_fung_daerah}', [DaerahController::class, 'destroy'])->middleware('permission:wilayah_fung_daerah.delete');

            Route::get('desa', [DesaController::class, 'index'])->middleware('permission:wilayah_fung_desa.view');
            Route::post('desa', [DesaController::class, 'store'])->middleware('permission:wilayah_fung_desa.create');
            Route::get('desa/{wilayah_fung_desa}', [DesaController::class, 'show'])->middleware('permission:wilayah_fung_desa.view');
            Route::put('desa/{wilayah_fung_desa}', [DesaController::class, 'update'])->middleware('permission:wilayah_fung_desa.update');
            Route::patch('desa/{wilayah_fung_desa}', [DesaController::class, 'update'])->middleware('permission:wilayah_fung_desa.update');
            Route::delete('desa/{wilayah_fung_desa}', [DesaController::class, 'destroy'])->middleware('permission:wilayah_fung_desa.delete');

            Route::get('kelompok', [KelompokController::class, 'index'])->middleware('permission:wilayah_fung_kelompok.view');
            Route::post('kelompok', [KelompokController::class, 'store'])->middleware('permission:wilayah_fung_kelompok.create');
            Route::get('kelompok/{wilayah_fung_kelompok}', [KelompokController::class, 'show'])->middleware('permission:wilayah_fung_kelompok.view');
            Route::put('kelompok/{wilayah_fung_kelompok}', [KelompokController::class, 'update'])->middleware('permission:wilayah_fung_kelompok.update');
            Route::patch('kelompok/{wilayah_fung_kelompok}', [KelompokController::class, 'update'])->middleware('permission:wilayah_fung_kelompok.update');
            Route::delete('kelompok/{wilayah_fung_kelompok}', [KelompokController::class, 'destroy'])->middleware('permission:wilayah_fung_kelompok.delete');

            Route::get('sub-kelompok', [SubKelompokController::class, 'index'])->middleware('permission:wilayah_fung_sub_kelompok.view');
            Route::post('sub-kelompok', [SubKelompokController::class, 'store'])->middleware('permission:wilayah_fung_sub_kelompok.create');
            Route::get('sub-kelompok/{wilayah_fung_sub_kelompok}', [SubKelompokController::class, 'show'])->middleware('permission:wilayah_fung_sub_kelompok.view');
            Route::put('sub-kelompok/{wilayah_fung_sub_kelompok}', [SubKelompokController::class, 'update'])->middleware('permission:wilayah_fung_sub_kelompok.update');
            Route::patch('sub-kelompok/{wilayah_fung_sub_kelompok}', [SubKelompokController::class, 'update'])->middleware('permission:wilayah_fung_sub_kelompok.update');
            Route::delete('sub-kelompok/{wilayah_fung_sub_kelompok}', [SubKelompokController::class, 'destroy'])->middleware('permission:wilayah_fung_sub_kelompok.delete');
        });

        Route::get('lokasi', [LokasiController::class, 'index'])->middleware('permission:lokasi.view');
        Route::post('lokasi/resolve-location', [LokasiController::class, 'resolveLocation'])
            ->middleware('permission:lokasi.view');
        Route::post('lokasi/resolve-coords', [LokasiController::class, 'resolveCoords'])
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

        Route::get('lookup', [LookupMController::class, 'index'])->middleware('permission:lookup.view');
        Route::post('lookup', [LookupMController::class, 'store'])->middleware('permission:lookup.create');
        Route::get('lookup/{lookup}', [LookupMController::class, 'show'])->middleware('permission:lookup.view');
        Route::put('lookup/{lookup}', [LookupMController::class, 'update'])->middleware('permission:lookup.update');
        Route::patch('lookup/{lookup}', [LookupMController::class, 'update'])->middleware('permission:lookup.update');
        Route::delete('lookup/{lookup}', [LookupMController::class, 'destroy'])->middleware('permission:lookup.delete');

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

        Route::prefix('wilayah-adm')->group(function () {
            Route::get('negara', [AdmNegaraController::class, 'index'])->middleware('permission:wilayah_adm_negara.view');
            Route::post('negara', [AdmNegaraController::class, 'store'])->middleware('permission:wilayah_adm_negara.create');
            Route::get('negara/{wilayah_adm_negara}', [AdmNegaraController::class, 'show'])->middleware('permission:wilayah_adm_negara.view');
            Route::put('negara/{wilayah_adm_negara}', [AdmNegaraController::class, 'update'])->middleware('permission:wilayah_adm_negara.update');
            Route::patch('negara/{wilayah_adm_negara}', [AdmNegaraController::class, 'update'])->middleware('permission:wilayah_adm_negara.update');
            Route::delete('negara/{wilayah_adm_negara}', [AdmNegaraController::class, 'destroy'])->middleware('permission:wilayah_adm_negara.delete');

            Route::get('provinsi', [AdmProvinsiController::class, 'index'])->middleware('permission:wilayah_adm_provinsi.view');
            Route::post('provinsi', [AdmProvinsiController::class, 'store'])->middleware('permission:wilayah_adm_provinsi.create');
            Route::get('provinsi/{wilayah_adm_provinsi}', [AdmProvinsiController::class, 'show'])->middleware('permission:wilayah_adm_provinsi.view');
            Route::put('provinsi/{wilayah_adm_provinsi}', [AdmProvinsiController::class, 'update'])->middleware('permission:wilayah_adm_provinsi.update');
            Route::patch('provinsi/{wilayah_adm_provinsi}', [AdmProvinsiController::class, 'update'])->middleware('permission:wilayah_adm_provinsi.update');
            Route::delete('provinsi/{wilayah_adm_provinsi}', [AdmProvinsiController::class, 'destroy'])->middleware('permission:wilayah_adm_provinsi.delete');

            Route::get('kabupaten-kota', [AdmKabupatenKotaController::class, 'index'])->middleware('permission:wilayah_adm_kabupaten_kota.view');
            Route::post('kabupaten-kota', [AdmKabupatenKotaController::class, 'store'])->middleware('permission:wilayah_adm_kabupaten_kota.create');
            Route::get('kabupaten-kota/{wilayah_adm_kabupaten_kota}', [AdmKabupatenKotaController::class, 'show'])->middleware('permission:wilayah_adm_kabupaten_kota.view');
            Route::put('kabupaten-kota/{wilayah_adm_kabupaten_kota}', [AdmKabupatenKotaController::class, 'update'])->middleware('permission:wilayah_adm_kabupaten_kota.update');
            Route::patch('kabupaten-kota/{wilayah_adm_kabupaten_kota}', [AdmKabupatenKotaController::class, 'update'])->middleware('permission:wilayah_adm_kabupaten_kota.update');
            Route::delete('kabupaten-kota/{wilayah_adm_kabupaten_kota}', [AdmKabupatenKotaController::class, 'destroy'])->middleware('permission:wilayah_adm_kabupaten_kota.delete');

            Route::get('kecamatan', [AdmKecamatanController::class, 'index'])->middleware('permission:wilayah_adm_kecamatan.view');
            Route::post('kecamatan', [AdmKecamatanController::class, 'store'])->middleware('permission:wilayah_adm_kecamatan.create');
            Route::get('kecamatan/{wilayah_adm_kecamatan}', [AdmKecamatanController::class, 'show'])->middleware('permission:wilayah_adm_kecamatan.view');
            Route::put('kecamatan/{wilayah_adm_kecamatan}', [AdmKecamatanController::class, 'update'])->middleware('permission:wilayah_adm_kecamatan.update');
            Route::patch('kecamatan/{wilayah_adm_kecamatan}', [AdmKecamatanController::class, 'update'])->middleware('permission:wilayah_adm_kecamatan.update');
            Route::delete('kecamatan/{wilayah_adm_kecamatan}', [AdmKecamatanController::class, 'destroy'])->middleware('permission:wilayah_adm_kecamatan.delete');

            Route::get('desa', [AdmDesaKelurahanController::class, 'index'])->middleware('permission:wilayah_adm_desa.view');
            Route::post('desa', [AdmDesaKelurahanController::class, 'store'])->middleware('permission:wilayah_adm_desa.create');
            Route::get('desa/{wilayah_adm_desa}', [AdmDesaKelurahanController::class, 'show'])->middleware('permission:wilayah_adm_desa.view');
            Route::put('desa/{wilayah_adm_desa}', [AdmDesaKelurahanController::class, 'update'])->middleware('permission:wilayah_adm_desa.update');
            Route::patch('desa/{wilayah_adm_desa}', [AdmDesaKelurahanController::class, 'update'])->middleware('permission:wilayah_adm_desa.update');
            Route::delete('desa/{wilayah_adm_desa}', [AdmDesaKelurahanController::class, 'destroy'])->middleware('permission:wilayah_adm_desa.delete');

            Route::get('kode-pos', [AdmKodePosController::class, 'index'])->middleware('permission:wilayah_adm_kode_pos.view');
            Route::post('kode-pos', [AdmKodePosController::class, 'store'])->middleware('permission:wilayah_adm_kode_pos.create');
            Route::get('kode-pos/{wilayah_adm_kode_pos}', [AdmKodePosController::class, 'show'])->middleware('permission:wilayah_adm_kode_pos.view');
            Route::put('kode-pos/{wilayah_adm_kode_pos}', [AdmKodePosController::class, 'update'])->middleware('permission:wilayah_adm_kode_pos.update');
            Route::patch('kode-pos/{wilayah_adm_kode_pos}', [AdmKodePosController::class, 'update'])->middleware('permission:wilayah_adm_kode_pos.update');
            Route::delete('kode-pos/{wilayah_adm_kode_pos}', [AdmKodePosController::class, 'destroy'])->middleware('permission:wilayah_adm_kode_pos.delete');
        });
    });

    Route::prefix('aplikasi')->middleware('superadmin')->group(function () {
        Route::get('konfig', [KonfigSystemKController::class, 'show'])->middleware('permission:konfig.view');
        Route::put('konfig', [KonfigSystemKController::class, 'update'])->middleware('permission:konfig.update');
        Route::patch('konfig', [KonfigSystemKController::class, 'update'])->middleware('permission:konfig.update');
        Route::post('konfig/assets/{asset}', [KonfigSystemKController::class, 'uploadAsset'])->middleware('permission:konfig.update');
        Route::delete('konfig/assets/{asset}', [KonfigSystemKController::class, 'deleteAsset'])->middleware('permission:konfig.update');
        Route::post('konfig/hari-libur/sync', [KonfigSystemKController::class, 'syncHariLibur'])->middleware('permission:konfig.update');
        Route::get('konfig/integration-logs', [IntegrationLogController::class, 'index']);
        Route::get('konfig/integration-logs/{id}', [IntegrationLogController::class, 'show']);
        Route::post('konfig/integration-logs', [IntegrationLogController::class, 'store'])->middleware('permission:konfig.update');
        Route::post('konfig/integrations/{provider}/check', [IntegrationLogController::class, 'check'])->middleware('permission:konfig.update');
        Route::post('konfig/integrations/expiry-sweep', [IntegrationLogController::class, 'sweepExpiry'])->middleware('permission:konfig.update');

        Route::get('konfig-dokumen', [KonfigDokumenKController::class, 'index'])->middleware('permission:konfig_dokumen.view');
        Route::get('konfig-dokumen/{lookupId}', [KonfigDokumenKController::class, 'show'])->middleware('permission:konfig_dokumen.view')->whereNumber('lookupId');
        Route::put('konfig-dokumen', [KonfigDokumenKController::class, 'update'])->middleware('permission:konfig_dokumen.update');
        Route::patch('konfig-dokumen', [KonfigDokumenKController::class, 'update'])->middleware('permission:konfig_dokumen.update');
        Route::post('konfig-dokumen/{lookupId}/assets/{asset}', [KonfigDokumenKController::class, 'uploadAsset'])
            ->middleware('permission:konfig_dokumen.update')
            ->whereNumber('lookupId')
            ->where('asset', 'logo-kiri|logo-kanan');
        Route::delete('konfig-dokumen/{lookupId}/assets/{asset}', [KonfigDokumenKController::class, 'deleteAsset'])
            ->middleware('permission:konfig_dokumen.update')
            ->whereNumber('lookupId')
            ->where('asset', 'logo-kiri|logo-kanan');

        Route::get('audit/login', [AuditLoginController::class, 'index'])->middleware('permission:audit_login.view');

        Route::get('audit/akses', [AuditActivityController::class, 'aksesIndex'])->middleware('permission:audit_access.view');
        Route::get('audit/akses/{id}', [AuditActivityController::class, 'aksesShow'])
            ->middleware('permission:audit_access.view')
            ->whereNumber('id');
        Route::get('audit/konfig', [AuditActivityController::class, 'konfigIndex'])->middleware('permission:audit_konfig.view');
        Route::get('audit/konfig/{id}', [AuditActivityController::class, 'konfigShow'])
            ->middleware('permission:audit_konfig.view')
            ->whereNumber('id');
        Route::get('audit/jamaah', [AuditActivityController::class, 'jamaahIndex'])->middleware('permission:audit_jamaah.view');
        Route::get('audit/jamaah/{id}', [AuditActivityController::class, 'jamaahShow'])
            ->middleware('permission:audit_jamaah.view')
            ->whereNumber('id');

        Route::get('log/error', [AppErrorLogController::class, 'index'])->middleware('permission:app_error_log.view');
        Route::delete('log/error', [AppErrorLogController::class, 'clear'])->middleware('permission:app_error_log.clear');
        Route::get('log/error/{id}', [AppErrorLogController::class, 'show'])
            ->middleware('permission:app_error_log.view')
            ->whereNumber('id');
        Route::patch('log/error/{id}', [AppErrorLogController::class, 'update'])
            ->middleware('permission:app_error_log.update')
            ->whereNumber('id');
    });

    Route::prefix('aplikasi/laporkan')->group(function () {
        Route::post('teknis', [AppReportController::class, 'storeTeknis'])->middleware('permission:app_report_teknis.create');
        Route::post('nonteknis', [AppReportController::class, 'storeNonteknis'])->middleware('permission:app_report_nonteknis.create');
        Route::get('saya', [AppReportController::class, 'mine'])->middleware('permission:app_report_status.view');
        Route::get('informasi', [AppReportController::class, 'index'])->middleware('permission:app_report_admin.view');
        Route::patch('informasi/{id}', [AppReportController::class, 'update'])
            ->middleware('permission:app_report_admin.update')
            ->whereNumber('id');
    });

    Route::prefix('aplikasi/kotak-masukan')->group(function () {
        Route::post('ide', [AppFeedbackController::class, 'storeIde'])->middleware('permission:app_feedback_idea.create');
        Route::get('ide/saya', [AppFeedbackController::class, 'mine'])->middleware('permission:app_feedback_idea_status.view');
        Route::post('testimoni', [AppFeedbackController::class, 'storeTestimoni'])->middleware('permission:app_feedback_testimonial.create');
        Route::get('galeri-testimoni', [AppFeedbackController::class, 'published'])->middleware('permission:app_feedback_gallery.view');
        Route::get('informasi', [AppFeedbackController::class, 'index'])->middleware('permission:app_feedback_admin.view');
        Route::patch('informasi/{id}', [AppFeedbackController::class, 'update'])
            ->middleware('permission:app_feedback_admin.update')
            ->whereNumber('id');
        Route::get('daftar-testimoni', [AppFeedbackController::class, 'indexTestimonials'])
            ->middleware('permission:app_feedback_testimonial_admin.view');
        Route::patch('daftar-testimoni/{id}', [AppFeedbackController::class, 'updateTestimonial'])
            ->middleware('permission:app_feedback_testimonial_admin.update')
            ->whereNumber('id');
    });
});
