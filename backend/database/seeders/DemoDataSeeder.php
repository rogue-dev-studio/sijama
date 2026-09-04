<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 17:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 19:15:00
 */

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\Dapukan;
use App\Models\Jamaah;
use App\Models\JamaahKeluarga;
use App\Models\Kelompok;
use App\Models\Keluarga;
use App\Models\Kegiatan;
use App\Models\KategoriKegiatan;
use App\Models\Lokasi;
use App\Models\LookupM;
use App\Models\User;
use App\Support\LookupTypes;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoDataSeeder extends Seeder
{
    /**
     * Opsional — tidak dipanggil DatabaseSeeder default.
     * Jalankan manual bila perlu data uji lokal: db:seed --class=DemoDataSeeder
     */
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->command?->warn('DemoDataSeeder skipped outside local/testing.');

            return;
        }

        $kelompok = Kelompok::query()->where('nama', 'Pajajaran Timur')->first();
        if (! $kelompok) {
            $this->command?->warn('Skip DemoDataSeeder: kelompok Pajajaran Timur tidak ditemukan.');

            return;
        }

        if (Jamaah::query()->where('wilayah_fung_kelompok_id', $kelompok->id)->exists()) {
            $this->command?->info('DemoDataSeeder: data demo jamaah sudah ada, dilewati.');

            return;
        }

        $jamaahKelompokDap = Dapukan::query()->where('slug', 'jamaah_kelompok')->first();
        $adminUser = User::query()->where('username', 'admin')->first();
        $pekerjaanId = LookupM::query()
            ->notDeleted()
            ->active()
            ->byType(LookupTypes::PEKERJAAN)
            ->where('lookup_value', 'karyawan_swasta')
            ->value('lookup_id');

        DB::transaction(function () use ($kelompok, $jamaahKelompokDap, $adminUser, $pekerjaanId) {
            $kepala = $this->createJamaah($kelompok->id, [
                'nik' => '3201010101010001',
                'nama' => 'Ahmad Demo Jamaah',
                'gender' => 'L',
                'tanggal_lahir' => '1985-03-12',
                'pekerjaan_id' => $pekerjaanId,
                'pendidikan' => 's1',
                'golongan_darah' => 'O',
                'status_pernikahan' => 'sudah_menikah',
                'alamat' => 'Jl. Pajajaran Timur No. 10',
                'rt' => '01',
                'rw' => '02',
                'no_hp' => '081234567890',
                'email' => 'ahmad.demo@sijama.local',
            ]);

            $istri = $this->createJamaah($kelompok->id, [
                'nik' => '3201010101010002',
                'nama' => 'Siti Demo Jamaah',
                'gender' => 'P',
                'tanggal_lahir' => '1988-07-20',
                'pekerjaan_id' => $pekerjaanId,
                'pendidikan' => 'sma',
                'golongan_darah' => 'A',
                'status_pernikahan' => 'sudah_menikah',
                'alamat' => 'Jl. Pajajaran Timur No. 10',
                'rt' => '01',
                'rw' => '02',
                'no_hp' => '081234567891',
                'email' => 'siti.demo@sijama.local',
            ]);

            $anak = $this->createJamaah($kelompok->id, [
                'nik' => '3201010101010003',
                'nama' => 'Rizki Demo Jamaah',
                'gender' => 'L',
                'tanggal_lahir' => '2012-11-05',
                'pendidikan' => 'sd',
                'golongan_darah' => 'O',
                'status_pernikahan' => 'belum_menikah',
                'alamat' => 'Jl. Pajajaran Timur No. 10',
                'rt' => '01',
                'rw' => '02',
            ]);

            $tetangga = $this->createJamaah($kelompok->id, [
                'nik' => '3201010101010004',
                'nama' => 'Budi Demo Santri',
                'gender' => 'L',
                'tanggal_lahir' => '1995-01-15',
                'pekerjaan_id' => $pekerjaanId,
                'pendidikan' => 'd1_d2_d3',
                'golongan_darah' => 'B',
                'status_pernikahan' => 'belum_menikah',
                'alamat' => 'Jl. Pajajaran Timur No. 12',
                'rt' => '01',
                'rw' => '02',
                'no_hp' => '081234567892',
            ]);

            foreach ([$kepala, $istri, $anak, $tetangga] as $jamaah) {
                if ($jamaahKelompokDap) {
                    $jamaah->dapukan()->syncWithoutDetaching([$jamaahKelompokDap->id]);
                }
            }

            $keluarga = Keluarga::query()->create([
                'wilayah_fung_kelompok_id' => $kelompok->id,
                'kepala_jamaah_id' => $kepala->id,
                'no_kk' => '3201010101010001',
                'alamat' => 'Jl. Pajajaran Timur No. 10',
                'rt' => '01',
                'rw' => '02',
                'status' => 'aktif',
            ]);

            $this->attachAnggota($keluarga->id, $kepala->id, 'kepala', true);
            $this->attachAnggota($keluarga->id, $istri->id, 'istri', false);
            $this->attachAnggota($keluarga->id, $anak->id, 'anak', false);

            User::query()->where('username', 'jamaah')->update([
                'jamaah_id' => $kepala->id,
                'name' => $kepala->nama,
                'email' => $kepala->email,
            ]);

            $lokasi = Lokasi::query()->where('is_active', true)->orderBy('id')->first();
            $kategoriPengajian = KategoriKegiatan::query()->where('nama', 'Pengajian')->first();
            $kategoriSosial = KategoriKegiatan::query()->where('nama', 'Kemandirian')->first()
                ?? KategoriKegiatan::query()->where('is_active', true)->orderBy('id')->first();

            $pengajianTanggal = now()->subDays(7);
            $kegiatanPengajian = Kegiatan::query()->create([
                'judul' => 'Pengajian Rutin Pajajaran Timur',
                'pemateri' => 'Ustadz Demo',
                'jenis' => 'Pengajian',
                'kategori_kegiatan_id' => $kategoriPengajian?->id,
                'tanggal' => $pengajianTanggal->toDateString(),
                'jam_mulai' => '19:30:00',
                'jam_selesai' => '21:00:00',
                'lokasi' => $lokasi?->nama,
                'lokasi_id' => $lokasi?->id,
                'status' => 'completed',
            ]);

            Kegiatan::query()->create([
                'judul' => 'Kerja Bakti Kelompok',
                'jenis' => $kategoriSosial?->nama ?? 'Kemandirian',
                'kategori_kegiatan_id' => $kategoriSosial?->id,
                'tanggal' => now()->subDays(3)->toDateString(),
                'lokasi' => $lokasi?->nama,
                'lokasi_id' => $lokasi?->id,
                'deskripsi' => 'Demo kegiatan kelompok untuk pengujian lokal.',
                'status' => 'completed',
            ]);

            if ($adminUser) {
                $session = AttendanceSession::query()->create([
                    'type' => 'kegiatan',
                    'ref_id' => $kegiatanPengajian->id,
                    'title' => $kegiatanPengajian->judul,
                    'opened_by' => $adminUser->id,
                    'opened_at' => $pengajianTanggal->copy()->setTime(19, 30),
                    'closed_at' => $pengajianTanggal->copy()->setTime(21, 0),
                    'status' => 'closed',
                ]);

                foreach ([$kepala, $istri, $anak, $tetangga] as $jamaah) {
                    Attendance::query()->create([
                        'session_id' => $session->id,
                        'jamaah_id' => $jamaah->id,
                        'method' => 'manual',
                        'recorded_by' => $adminUser->id,
                        'recorded_at' => $pengajianTanggal->copy()->setTime(19, 30),
                    ]);
                }
            }
        });

        $this->command?->info('DemoDataSeeder: jamaah, keluarga, kegiatan, dan kehadiran demo siap.');
    }

    /** @param array<string, mixed> $data */
    private function createJamaah(int $wilayah_fung_kelompokId, array $data): Jamaah
    {
        return Jamaah::query()->create([
            'wilayah_fung_kelompok_id' => $wilayah_fung_kelompokId,
            'status' => 'aktif',
            ...$data,
        ]);
    }

    private function attachAnggota(int $keluargaId, int $jamaahId, string $hubungan, bool $isKepala): void
    {
        JamaahKeluarga::query()->create([
            'keluarga_id' => $keluargaId,
            'jamaah_id' => $jamaahId,
            'hubungan_keluarga' => $hubungan,
            'is_kepala_keluarga' => $isKepala,
        ]);
    }
}
