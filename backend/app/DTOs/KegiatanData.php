<?php

namespace App\DTOs;

use App\Models\KategoriKegiatan;
use App\Models\Lokasi;
use App\Models\Pemateri;

readonly class KegiatanData
{
    /** @param  list<int>  $materiIds */
    public function __construct(
        public string $judul,
        public ?string $pemateri,
        public ?int $pemateriId,
        public array $materiIds,
        public ?string $jenis,
        public ?int $kategoriKegiatanId,
        public string $tanggal,
        public ?string $jamMulai,
        public ?string $jamSelesai,
        public ?string $lokasi,
        public ?int $lokasiId,
        public ?string $deskripsi,
        public ?string $catatan,
        public ?string $status = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            judul: $data['judul'],
            pemateri: $data['pemateri'] ?? null,
            pemateriId: isset($data['pemateri_id']) ? (int) $data['pemateri_id'] : null,
            materiIds: self::parseMateriIds($data),
            jenis: $data['jenis'] ?? null,
            kategoriKegiatanId: isset($data['kategori_kegiatan_id']) ? (int) $data['kategori_kegiatan_id'] : null,
            tanggal: $data['tanggal'],
            jamMulai: $data['jam_mulai'] ?? null,
            jamSelesai: $data['jam_selesai'] ?? null,
            lokasi: $data['lokasi'] ?? null,
            lokasiId: isset($data['lokasi_id']) ? (int) $data['lokasi_id'] : null,
            deskripsi: $data['deskripsi'] ?? null,
            catatan: $data['catatan'] ?? null,
            status: $data['status'] ?? null,
        );
    }

    /** @return list<int> */
    private static function parseMateriIds(array $data): array
    {
        if (isset($data['materi_ids']) && is_array($data['materi_ids'])) {
            return array_values(array_unique(array_filter(array_map('intval', $data['materi_ids']))));
        }

        if (isset($data['materi_id']) && $data['materi_id']) {
            return [(int) $data['materi_id']];
        }

        return [];
    }

    public function toModelAttributes(): array
    {
        $pemateriId = $this->pemateriId;
        $lokasiId = $this->lokasiId;
        $kategoriId = $this->kategoriKegiatanId;
        $pemateri = $this->pemateri;
        $lokasi = $this->lokasi;
        $jenis = $this->jenis;

        if ($pemateriId) {
            $pemateri = Pemateri::query()->whereKey($pemateriId)->value('nama') ?? $pemateri;
        }

        if ($lokasiId) {
            $lokasi = Lokasi::query()->whereKey($lokasiId)->value('nama') ?? $lokasi;
        }

        if ($kategoriId) {
            $jenis = KategoriKegiatan::query()->whereKey($kategoriId)->value('nama') ?? $jenis;
        }

        $attributes = [
            'judul' => $this->judul,
            'pemateri' => $pemateri,
            'pemateri_id' => $pemateriId,
            'jenis' => $jenis,
            'kategori_kegiatan_id' => $kategoriId,
            'tanggal' => $this->tanggal,
            'jam_mulai' => $this->normalizeTime($this->jamMulai),
            'jam_selesai' => $this->normalizeTime($this->jamSelesai),
            'lokasi' => $lokasi,
            'lokasi_id' => $lokasiId,
            'deskripsi' => $this->deskripsi,
            'catatan' => $this->catatan,
        ];

        if ($this->status !== null) {
            $attributes['status'] = $this->status;
        }

        return $attributes;
    }

    private function normalizeTime(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (strlen($value) === 5) {
            return $value.':00';
        }

        return $value;
    }
}
