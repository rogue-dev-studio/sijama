<?php

namespace App\DTOs;

use App\Models\KategoriKegiatan;
use App\Models\Lokasi;

readonly class KegiatanData
{
    public function __construct(
        public string $judul,
        public ?string $jenis,
        public ?int $kategoriKegiatanId,
        public string $tanggal,
        public ?string $lokasi,
        public ?int $lokasiId,
        public ?string $deskripsi,
        public ?string $status = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            judul: $data['judul'],
            jenis: $data['jenis'] ?? null,
            kategoriKegiatanId: isset($data['kategori_kegiatan_id']) ? (int) $data['kategori_kegiatan_id'] : null,
            tanggal: $data['tanggal'],
            lokasi: $data['lokasi'] ?? null,
            lokasiId: isset($data['lokasi_id']) ? (int) $data['lokasi_id'] : null,
            deskripsi: $data['deskripsi'] ?? null,
            status: $data['status'] ?? null,
        );
    }

    public function toModelAttributes(): array
    {
        $lokasiId = $this->lokasiId;
        $kategoriId = $this->kategoriKegiatanId;
        $lokasi = $this->lokasi;
        $jenis = $this->jenis;

        if ($lokasiId) {
            $lokasi = Lokasi::query()->whereKey($lokasiId)->value('nama') ?? $lokasi;
        }

        if ($kategoriId) {
            $jenis = KategoriKegiatan::query()->whereKey($kategoriId)->value('nama') ?? $jenis;
        }

        $attributes = [
            'judul' => $this->judul,
            'jenis' => $jenis,
            'kategori_kegiatan_id' => $kategoriId,
            'tanggal' => $this->tanggal,
            'lokasi' => $lokasi,
            'lokasi_id' => $lokasiId,
            'deskripsi' => $this->deskripsi,
        ];

        if ($this->status !== null) {
            $attributes['status'] = $this->status;
        }

        return $attributes;
    }
}
