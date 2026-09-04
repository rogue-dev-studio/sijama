/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:10:00
 */

import type {
  AdmDesaKelurahan,
  AdmKabupatenKota,
  AdmKecamatan,
  AdmNegara,
  AdmProvinsi,
  JamaahInput,
} from '../../api/types'
import { SearchableSelect } from '../../components/SearchableSelect'
import { kodePosFromDesa } from '../../lib/kodePosFromDesa'

type JamaahAddressFieldsProps = {
  form: JamaahInput
  negaraList: AdmNegara[]
  provinsiList: AdmProvinsi[]
  kabupatenKotaList: AdmKabupatenKota[]
  kecamatanList: AdmKecamatan[]
  desaKelurahanList: AdmDesaKelurahan[]
  selectedNegaraId: number
  selectedProvinsiId: number
  selectedKabupatenKotaId: number
  selectedKecamatanId: number
  updateField: <K extends keyof JamaahInput>(key: K, value: JamaahInput[K]) => void
  onNegaraChange: (negaraId: number) => void
  onProvinsiChange: (provinsiId: number) => void
  onKabupatenKotaChange: (kabupatenKotaId: number) => void
  onKecamatanChange: (kecamatanId: number) => void
}

export function JamaahAddressFields({
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
  updateField,
  onNegaraChange,
  onProvinsiChange,
  onKabupatenKotaChange,
  onKecamatanChange,
}: JamaahAddressFieldsProps) {
  function handleDesaKelurahanChange(next: string) {
    const desaId = next ? Number(next) : null
    updateField('wilayah_adm_desa_id', desaId)
    updateField('kode_pos', kodePosFromDesa(desaKelurahanList, desaId))
  }

  return (
    <>
      <h2 className="form-section-title">Alamat administratif (opsional)</h2>
      <p className="field-hint">
        Lengkapi alamat, RT/RW, wilayah administrasi resmi, dan kode pos jamaah bila tersedia.
      </p>
      <div className="form-grid form-grid--2">
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="alamat">Alamat</label>
          <textarea
            id="alamat"
            value={form.alamat || ''}
            onChange={(event) => updateField('alamat', event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="rt">RT</label>
          <input
            id="rt"
            value={form.rt || ''}
            onChange={(event) => updateField('rt', event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="rw">RW</label>
          <input
            id="rw"
            value={form.rw || ''}
            onChange={(event) => updateField('rw', event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="wilayah_adm_negara_id">Negara</label>
          <SearchableSelect
            id="wilayah_adm_negara_id"
            value={selectedNegaraId ? String(selectedNegaraId) : ''}
            onChange={(next) => void onNegaraChange(Number(next) || 0)}
            placeholder="Pilih negara"
            options={[
              { value: '', label: 'Pilih negara' },
              ...negaraList.map((item) => ({
                value: String(item.id),
                label: item.nama,
              })),
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="wilayah_adm_provinsi_id">Provinsi</label>
          <SearchableSelect
            id="wilayah_adm_provinsi_id"
            value={selectedProvinsiId ? String(selectedProvinsiId) : ''}
            onChange={(next) => void onProvinsiChange(Number(next) || 0)}
            disabled={provinsiList.length === 0}
            placeholder="Pilih provinsi"
            options={[
              { value: '', label: 'Pilih provinsi' },
              ...provinsiList.map((item) => ({
                value: String(item.id),
                label: item.nama,
              })),
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="wilayah_adm_kabupaten_kota_id">Kabupaten/Kota</label>
          <SearchableSelect
            id="wilayah_adm_kabupaten_kota_id"
            value={selectedKabupatenKotaId ? String(selectedKabupatenKotaId) : ''}
            onChange={(next) => void onKabupatenKotaChange(Number(next) || 0)}
            disabled={kabupatenKotaList.length === 0}
            placeholder="Pilih kabupaten/kota"
            options={[
              { value: '', label: 'Pilih kabupaten/kota' },
              ...kabupatenKotaList.map((item) => ({
                value: String(item.id),
                label: item.nama,
              })),
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="wilayah_adm_kecamatan_id">Kecamatan</label>
          <SearchableSelect
            id="wilayah_adm_kecamatan_id"
            value={selectedKecamatanId ? String(selectedKecamatanId) : ''}
            onChange={(next) => void onKecamatanChange(Number(next) || 0)}
            disabled={kecamatanList.length === 0}
            placeholder="Pilih kecamatan"
            options={[
              { value: '', label: 'Pilih kecamatan' },
              ...kecamatanList.map((item) => ({
                value: String(item.id),
                label: item.nama,
              })),
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="wilayah_adm_desa_id">Desa/Kelurahan</label>
          <SearchableSelect
            id="wilayah_adm_desa_id"
            value={form.wilayah_adm_desa_id ? String(form.wilayah_adm_desa_id) : ''}
            onChange={handleDesaKelurahanChange}
            disabled={desaKelurahanList.length === 0}
            placeholder="Pilih desa/kelurahan"
            options={[
              { value: '', label: 'Pilih desa/kelurahan' },
              ...desaKelurahanList.map((item) => ({
                value: String(item.id),
                label: item.nama,
              })),
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="kode_pos">Kode Pos</label>
          <input
            id="kode_pos"
            value={form.kode_pos || ''}
            onChange={(event) => updateField('kode_pos', event.target.value)}
            maxLength={5}
            pattern="\d{5}"
            title="5 digit angka"
            placeholder="mis. 12345"
          />
          <p className="field-hint">
            Terisi otomatis dari master kode pos desa/kelurahan jika ada. Bisa diubah manual.
          </p>
        </div>
      </div>
    </>
  )
}
