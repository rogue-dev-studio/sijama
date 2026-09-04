<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KegiatanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'judul' => $this->judul,
            'pemateri' => $this->pemateri,
            'pemateri_id' => $this->pemateri_id,
            'pemateri_ref' => $this->whenLoaded('pemateriRef', fn () => $this->pemateriRef ? [
                'id' => $this->pemateriRef->id,
                'nama' => $this->pemateriRef->nama,
            ] : null),
            'materi_ids' => $this->whenLoaded('materi', fn () => $this->materi->pluck('id')->values()->all()),
            'materi_list' => $this->whenLoaded('materi', fn () => $this->materi->map(fn ($item) => [
                'id' => $item->id,
                'nama' => $item->nama,
            ])->values()->all()),
            'jenis' => $this->jenis,
            'kategori_kegiatan_id' => $this->kategori_kegiatan_id,
            'kategori_kegiatan' => $this->whenLoaded('kategoriKegiatan', fn () => $this->kategoriKegiatan ? [
                'id' => $this->kategoriKegiatan->id,
                'nama' => $this->kategoriKegiatan->nama,
                'calendar_color' => $this->kategoriKegiatan->calendar_color,
            ] : null),
            'tanggal' => $this->tanggal?->format('Y-m-d'),
            'jam_mulai' => $this->jam_mulai ? substr((string) $this->jam_mulai, 0, 5) : null,
            'jam_selesai' => $this->jam_selesai ? substr((string) $this->jam_selesai, 0, 5) : null,
            'lokasi' => $this->lokasi,
            'lokasi_id' => $this->lokasi_id,
            'lokasi_ref' => $this->whenLoaded('lokasiRef', fn () => $this->lokasiRef ? [
                'id' => $this->lokasiRef->id,
                'nama' => $this->lokasiRef->nama,
                'jenis' => $this->lokasiRef->jenis,
            ] : null),
            'deskripsi' => $this->deskripsi,
            'catatan' => $this->catatan,
            'status' => $this->status,
            'jadwal_rutin_id' => $this->jadwal_rutin_id,
            'wilayah_fung_daerah_id' => $this->wilayah_fung_daerah_id,
            'wilayah_fung_desa_id' => $this->wilayah_fung_desa_id,
            'wilayah_fung_kelompok_id' => $this->wilayah_fung_kelompok_id,
            'jadwal_rutin' => $this->whenLoaded('jadwalRutin', fn () => $this->jadwalRutin ? [
                'id' => $this->jadwalRutin->id,
                'judul' => $this->jadwalRutin->judul,
                'is_active' => $this->jadwalRutin->is_active,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
