/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:30:00
 */

import type {
  AdmDesaKelurahan,
  AdmKabupatenKota,
  AdmKecamatan,
  AdmNegara,
  AdmProvinsi,
  KeluargaInput,
} from '../../api/types'
import { SearchableSelect } from '../../components/SearchableSelect'
import { kodePosFromDesa } from '../../lib/kodePosFromDesa'

type KeluargaAddressFieldsProps = {
  form: KeluargaInput
  negaraList: AdmNegara[]
  provinsiList: AdmProvinsi[]
  kabupatenKotaList: AdmKabupatenKota[]
  kecamatanList: AdmKecamatan[]
  desaKelurahanList: AdmDesaKelurahan[]
  selectedNegaraId: number
  selectedProvinsiId: number
  selectedKabupatenKotaId: number
  selectedKecamatanId: number
  onFieldChange: <K extends keyof KeluargaInput>(key: K, value: KeluargaInput[K]) => void
  onNegaraChange: (negaraId: number) => void
  onProvinsiChange: (provinsiId: number) => void
  onKabupatenKotaChange: (kabupatenKotaId: number) => void
  onKecamatanChange: (kecamatanId: number) => void
}

export function KeluargaAddressFields({
  form,
  negaraList,
  provinsiList,
  kabupatenKotaList,
  kecamatanList,
  desaKelurahanList,
  selectedNegaraId,
  selectedProvinsiId,
  selectedKabupatenKotaId,
  selectedKecamatanId,
  onFieldChange,
  onNegaraChange,
  onProvinsiChange,
  onKabupatenKotaChange,
  onKecamatanChange,
}: KeluargaAddressFieldsProps) {
  function handleDesaKelurahanChange(next: string) {
    const desaId = next ? Number(next) : null
    onFieldChange('adm_desa_kelurahan_id', desaId)
    onFieldChange('kode_pos', kodePosFromDesa(desaKelurahanList, desaId))
  }

  return (
    <div className="form-grid form-grid--2">
      <div className="field field--full">
        <label htmlFor="alamat">Alamat jalan / detail</label>
        <textarea
          id="alamat"
          rows={3}
          value={form.alamat || ''}
          onChange={(event) => onFieldChange('alamat', event.target.value)}
          placeholder="Nama jalan, nomor rumah, kompleks, dll."
        />
      </div>
      <div className="field">
        <label htmlFor="rt">RT</label>
        <input
          id="rt"
          value={form.rt || ''}
          onChange={(event) => onFieldChange('rt', event.target.value)}
          placeholder="Opsional"
        />
      </div>
      <div className="field">
        <label htmlFor="rw">RW</label>
        <input
          id="rw"
          value={form.rw || ''}
          onChange={(event) => onFieldChange('rw', event.target.value)}
          placeholder="Opsional"
        />
      </div>
      <div className="field">
        <label htmlFor="negara_id">Negara</label>
        <SearchableSelect
          id="negara_id"
          value={selectedNegaraId ? String(selectedNegaraId) : ''}
          onChange={(next) => void onNegaraChange(Number(next) || 0)}
          placeholder="Pilih negara"
          options={[
            { value: '', label: 'Pilih negara' },
            ...negaraList.map((item) => ({ value: String(item.id), label: item.nama })),
          ]}
        />
      </div>
      <div className="field">
        <label htmlFor="provinsi_id">Provinsi</label>
        <SearchableSelect
          id="provinsi_id"
          value={selectedProvinsiId ? String(selectedProvinsiId) : ''}
          onChange={(next) => void onProvinsiChange(Number(next) || 0)}
          disabled={provinsiList.length === 0}
          placeholder="Pilih provinsi"
          options={[
            { value: '', label: 'Pilih provinsi' },
            ...provinsiList.map((item) => ({ value: String(item.id), label: item.nama })),
          ]}
        />
      </div>
      <div className="field">
        <label htmlFor="kabupaten_kota_id">Kabupaten/Kota</label>
        <SearchableSelect
          id="kabupaten_kota_id"
          value={selectedKabupatenKotaId ? String(selectedKabupatenKotaId) : ''}
          onChange={(next) => void onKabupatenKotaChange(Number(next) || 0)}
          disabled={kabupatenKotaList.length === 0}
          placeholder="Pilih kabupaten/kota"
          options={[
            { value: '', label: 'Pilih kabupaten/kota' },
            ...kabupatenKotaList.map((item) => ({ value: String(item.id), label: item.nama })),
          ]}
        />
      </div>
      <div className="field">
        <label htmlFor="kecamatan_id">Kecamatan</label>
        <SearchableSelect
          id="kecamatan_id"
          value={selectedKecamatanId ? String(selectedKecamatanId) : ''}
          onChange={(next) => void onKecamatanChange(Number(next) || 0)}
          disabled={kecamatanList.length === 0}
          placeholder="Pilih kecamatan"
          options={[
            { value: '', label: 'Pilih kecamatan' },
            ...kecamatanList.map((item) => ({ value: String(item.id), label: item.nama })),
          ]}
        />
      </div>
      <div className="field">
        <label htmlFor="adm_desa_kelurahan_id">Desa/Kelurahan</label>
        <SearchableSelect
          id="adm_desa_kelurahan_id"
          value={form.adm_desa_kelurahan_id ? String(form.adm_desa_kelurahan_id) : ''}
          onChange={handleDesaKelurahanChange}
          disabled={desaKelurahanList.length === 0}
          placeholder="Pilih desa/kelurahan"
          options={[
            { value: '', label: 'Pilih desa/kelurahan' },
            ...desaKelurahanList.map((item) => ({ value: String(item.id), label: item.nama })),
          ]}
        />
      </div>
      <div className="field">
        <label htmlFor="kode_pos">Kode pos</label>
        <input
          id="kode_pos"
          value={form.kode_pos || ''}
          onChange={(event) => onFieldChange('kode_pos', event.target.value)}
          maxLength={5}
          pattern="\d{5}"
          title="5 digit angka"
          placeholder="mis. 12345"
        />
        <p className="field-hint">Terisi otomatis dari desa/kelurahan bila tersedia di master.</p>
      </div>
    </div>
  )
}
