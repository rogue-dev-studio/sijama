<?php

namespace App\DTOs;

use App\Support\JamaahKategoriUmur;
use Carbon\Carbon;

readonly class JamaahData
{
    /**
     * @param  list<int>|null  $dapukanIds
     */
    public function __construct(
        public ?string $nik,
        public string $nama,
        public string $gender,
        public ?string $tanggalLahir,
        public ?string $pekerjaan,
        public ?int $pekerjaanId,
        public ?string $pendidikan,
        public ?string $statusPernikahan,
        public ?string $alamat,
        public ?string $rt,
        public ?string $rw,
        public string $noHp,
        public ?string $email,
        public ?string $status = null,
        public ?string $fotoPath = null,
        public ?int $kelompokId = null,
        public ?int $admDesaKelurahanId = null,
        public ?string $kodePos = null,
        public bool $hasPekerjaanId = false,
        public ?array $dapukanIds = null,
        public bool $hasDapukanIds = false,
    ) {}

    public static function fromArray(array $data): self
    {
        $dapukanIds = null;
        if (array_key_exists('dapukan_ids', $data)) {
            $dapukanIds = collect($data['dapukan_ids'] ?? [])
                ->filter(fn ($id) => $id !== null && $id !== '')
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->values()
                ->all();
        }

        return new self(
            nik: $data['nik'] ?? null,
            nama: $data['nama'],
            gender: $data['gender'],
            tanggalLahir: $data['tanggal_lahir'] ?? null,
            pekerjaan: $data['pekerjaan'] ?? null,
            pekerjaanId: array_key_exists('pekerjaan_id', $data) && $data['pekerjaan_id'] !== null
                ? (int) $data['pekerjaan_id']
                : null,
            pendidikan: $data['pendidikan'] ?? null,
            statusPernikahan: $data['status_pernikahan'] ?? null,
            alamat: $data['alamat'] ?? null,
            rt: isset($data['rt']) && $data['rt'] !== '' ? (string) $data['rt'] : null,
            rw: isset($data['rw']) && $data['rw'] !== '' ? (string) $data['rw'] : null,
            noHp: $data['no_hp'],
            email: $data['email'] ?? null,
            status: $data['status'] ?? null,
            fotoPath: $data['foto_path'] ?? null,
            kelompokId: isset($data['kelompok_id']) ? (int) $data['kelompok_id'] : null,
            admDesaKelurahanId: isset($data['adm_desa_kelurahan_id']) ? (int) $data['adm_desa_kelurahan_id'] : null,
            kodePos: $data['kode_pos'] ?? null,
            hasPekerjaanId: array_key_exists('pekerjaan_id', $data),
            dapukanIds: $dapukanIds,
            hasDapukanIds: array_key_exists('dapukan_ids', $data),
        );
    }

    public function toModelAttributes(): array
    {
        $tanggalLahir = $this->tanggalLahir ? Carbon::parse($this->tanggalLahir) : null;

        $attributes = [
            'nik' => $this->nik,
            'nama' => $this->nama,
            'gender' => $this->gender,
            'tanggal_lahir' => $this->tanggalLahir,
            'status_pernikahan' => $this->statusPernikahan,
            'kategori_umur' => JamaahKategoriUmur::classify($tanggalLahir, $this->statusPernikahan),
            'pekerjaan' => $this->pekerjaan,
            'pendidikan' => $this->pendidikan,
            'alamat' => $this->alamat,
            'rt' => $this->rt,
            'rw' => $this->rw,
            'no_hp' => $this->noHp,
            'email' => $this->email,
        ];

        if ($this->hasPekerjaanId) {
            $attributes['pekerjaan_id'] = $this->pekerjaanId;
        }

        if ($this->status !== null) {
            $attributes['status'] = $this->status;
        }

        if ($this->fotoPath !== null) {
            $attributes['foto_path'] = $this->fotoPath;
        }

        if ($this->kelompokId !== null) {
            $attributes['kelompok_id'] = $this->kelompokId;
        }

        if ($this->admDesaKelurahanId !== null) {
            $attributes['adm_desa_kelurahan_id'] = $this->admDesaKelurahanId;
        }

        if ($this->kodePos !== null) {
            $attributes['kode_pos'] = $this->kodePos;
        }

        return $attributes;
    }
}
