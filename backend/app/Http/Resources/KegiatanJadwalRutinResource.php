<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 18:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 18:10:00
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KegiatanJadwalRutinResource extends JsonResource
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
            'kategori_kegiatan_id' => $this->kategori_kegiatan_id,
            'kategori_kegiatan' => $this->whenLoaded('kategoriKegiatan', fn () => $this->kategoriKegiatan ? [
                'id' => $this->kategoriKegiatan->id,
                'nama' => $this->kategoriKegiatan->nama,
            ] : null),
            'lokasi' => $this->lokasi,
            'lokasi_id' => $this->lokasi_id,
            'lokasi_ref' => $this->whenLoaded('lokasiRef', fn () => $this->lokasiRef ? [
                'id' => $this->lokasiRef->id,
                'nama' => $this->lokasiRef->nama,
                'jenis' => $this->lokasiRef->jenis,
            ] : null),
            'deskripsi' => $this->deskripsi,
            'frekuensi' => $this->frekuensi,
            'day_of_week' => $this->day_of_week,
            'day_of_month' => $this->day_of_month,
            'month_of_year' => $this->month_of_year,
            'jam_mulai' => $this->jam_mulai ? substr((string) $this->jam_mulai, 0, 5) : null,
            'jam_selesai' => $this->jam_selesai ? substr((string) $this->jam_selesai, 0, 5) : null,
            'scope_level' => $this->scope_level,
            'wilayah_fung_daerah_id' => $this->wilayah_fung_daerah_id,
            'wilayah_fung_desa_id' => $this->wilayah_fung_desa_id,
            'wilayah_fung_kelompok_id' => $this->wilayah_fung_kelompok_id,
            'wilayah_fung_daerah' => $this->whenLoaded('wilayahFungDaerah', fn () => $this->wilayahFungDaerah ? [
                'id' => $this->wilayahFungDaerah->id,
                'nama' => $this->wilayahFungDaerah->nama,
            ] : null),
            'wilayah_fung_desa' => $this->whenLoaded('wilayahFungDesa', fn () => $this->wilayahFungDesa ? [
                'id' => $this->wilayahFungDesa->id,
                'nama' => $this->wilayahFungDesa->nama,
            ] : null),
            'wilayah_fung_kelompok' => $this->whenLoaded('wilayahFungKelompok', fn () => $this->wilayahFungKelompok ? [
                'id' => $this->wilayahFungKelompok->id,
                'nama' => $this->wilayahFungKelompok->nama,
            ] : null),
            'effective_from' => $this->effective_from?->format('Y-m-d'),
            'effective_until' => $this->effective_until?->format('Y-m-d'),
            'generate_horizon_days' => $this->generate_horizon_days,
            'last_generated_until' => $this->last_generated_until?->format('Y-m-d'),
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
