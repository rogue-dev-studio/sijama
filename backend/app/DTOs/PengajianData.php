<?php

namespace App\DTOs;

use App\Models\Lokasi;
use App\Models\Materi;
use App\Models\Pemateri;

readonly class PengajianData
{
    public function __construct(
        public string $judul,
        public ?string $pemateri,
        public ?int $pemateriId,
        public ?string $lokasi,
        public ?int $lokasiId,
        public ?int $materiId,
        public ?int $kategoriKegiatanId,
        public string $startsAt,
        public ?string $endsAt,
        public ?string $catatan,
        public ?string $status = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            judul: $data['judul'],
            pemateri: $data['pemateri'] ?? null,
            pemateriId: isset($data['pemateri_id']) ? (int) $data['pemateri_id'] : null,
            lokasi: $data['lokasi'] ?? null,
            lokasiId: isset($data['lokasi_id']) ? (int) $data['lokasi_id'] : null,
            materiId: isset($data['materi_id']) ? (int) $data['materi_id'] : null,
            kategoriKegiatanId: isset($data['kategori_kegiatan_id']) ? (int) $data['kategori_kegiatan_id'] : null,
            startsAt: $data['starts_at'],
            endsAt: $data['ends_at'] ?? null,
            catatan: $data['catatan'] ?? null,
            status: $data['status'] ?? null,
        );
    }

    public function toModelAttributes(): array
    {
        $pemateriId = $this->pemateriId;
        $lokasiId = $this->lokasiId;
        $pemateri = $this->pemateri;
        $lokasi = $this->lokasi;

        if ($pemateriId) {
            $pemateri = Pemateri::query()->whereKey($pemateriId)->value('nama') ?? $pemateri;
        }

        if ($lokasiId) {
            $lokasi = Lokasi::query()->whereKey($lokasiId)->value('nama') ?? $lokasi;
        }

        $attributes = [
            'judul' => $this->judul,
            'pemateri' => $pemateri,
            'pemateri_id' => $pemateriId,
            'lokasi' => $lokasi,
            'lokasi_id' => $lokasiId,
            'materi_id' => $this->materiId,
            'kategori_kegiatan_id' => $this->kategoriKegiatanId,
            'starts_at' => $this->startsAt,
            'ends_at' => $this->endsAt,
            'catatan' => $this->catatan,
        ];

        if ($this->status !== null) {
            $attributes['status'] = $this->status;
        }

        return $attributes;
    }
}
