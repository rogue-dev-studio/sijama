/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:45:00
 */

import type { JamaahDapukanOption, JamaahInput, Kelompok, LookupOption } from '../../api/types'
import { SearchableSelect } from '../../components/SearchableSelect'
import {
  JAMAHA_KELOMPOK_DAPUKAN_SLUG,
  normalizeDapukanIds,
} from './jamaahFormUtils'

type JamaahProfileFieldsProps = {
  form: JamaahInput
  kelompokList: Kelompok[]
  pekerjaanOptions: LookupOption[]
  jenisKelaminOptions: LookupOption[]
  golonganDarahOptions: LookupOption[]
  statusPernikahanOptions: LookupOption[]
  pendidikanOptions: LookupOption[]
  dapukanList: JamaahDapukanOption[]
  dapukanError: string | null
  fieldMessage: (name: string) => string | null
  isFieldInvalid: (name: string) => boolean
  updateField: <K extends keyof JamaahInput>(key: K, value: JamaahInput[K]) => void
  onKelompokChange: (kelompokId: number) => void
  onNikChange: (value: string) => void
  onToggleDapukan: (id: number) => void
  onPekerjaanChange: (pekerjaanId: number | null) => void
}

function toValueOptions(items: LookupOption[], emptyLabel: string) {
  return [
    { value: '', label: emptyLabel },
    ...items
      .filter((item) => item.value)
      .map((item) => ({
        value: String(item.value),
        label: item.name || String(item.value),
      })),
  ]
}

export function JamaahProfileFields({
  form,
  kelompokList,
  pekerjaanOptions,
  jenisKelaminOptions,
  golonganDarahOptions,
  statusPernikahanOptions,
  pendidikanOptions,
  dapukanList,
  dapukanError,
  fieldMessage,
  isFieldInvalid,
  updateField,
  onKelompokChange,
  onNikChange,
  onToggleDapukan,
  onPekerjaanChange,
}: JamaahProfileFieldsProps) {
  const genderOptions =
    jenisKelaminOptions.length > 0
      ? jenisKelaminOptions
          .filter((item) => item.value)
          .map((item) => ({
            value: String(item.value),
            label: item.name || String(item.value),
          }))
      : [
          { value: 'L', label: 'Laki-laki' },
          { value: 'P', label: 'Perempuan' },
        ]

  return (
    <div className="form-grid form-grid--2">
      <div className="field">
        <label htmlFor="kelompok_id">Kelompok</label>
        <SearchableSelect
          id="kelompok_id"
          value={form.kelompok_id ? String(form.kelompok_id) : ''}
          onChange={(next) => onKelompokChange(Number(next) || 0)}
          required
          disabled={kelompokList.length === 0}
          aria-invalid={isFieldInvalid('kelompok_id')}
          placeholder="Pilih kelompok"
          options={kelompokList.map((item) => ({
            value: String(item.id),
            label: item.desa
              ? `${item.desa.kode ? `${item.desa.kode} ` : ''}${item.desa.nama} — ${item.nama}`
              : item.nama,
          }))}
        />
        <p className="field-hint">
          Daftar kelompok mengikuti cakupan wilayah akun Anda (pusat/daerah/desa/kelompok).
        </p>
        {fieldMessage('kelompok_id') && (
          <p className="field-hint field-hint--error">{fieldMessage('kelompok_id')}</p>
        )}
      </div>
      <div className="field">
        <label htmlFor="nama">Nama</label>
        <input
          id="nama"
          value={form.nama}
          onChange={(event) => updateField('nama', event.target.value)}
          required
          aria-invalid={isFieldInvalid('nama')}
        />
        {fieldMessage('nama') && (
          <p className="field-hint field-hint--error">{fieldMessage('nama')}</p>
        )}
      </div>
      <div className="field">
        <label htmlFor="nik">NIK</label>
        <input
          id="nik"
          value={form.nik || ''}
          onChange={(event) => onNikChange(event.target.value)}
          inputMode="numeric"
          maxLength={16}
          placeholder="16 digit"
          aria-invalid={isFieldInvalid('nik')}
        />
        {fieldMessage('nik') && (
          <p className="field-hint field-hint--error">{fieldMessage('nik')}</p>
        )}
        <p className="field-hint">
          Jika NIK 16 digit valid, tanggal lahir dan jenis kelamin diisi otomatis dari kode NIK.
        </p>
      </div>
      <div className="field">
        <label htmlFor="gender">Jenis kelamin</label>
        <SearchableSelect
          id="gender"
          value={form.gender}
          onChange={(next) => updateField('gender', next as 'L' | 'P')}
          required
          aria-invalid={isFieldInvalid('gender')}
          placeholder="Pilih jenis kelamin"
          options={genderOptions}
        />
      </div>
      <div className="field">
        <label htmlFor="tanggal_lahir">Tanggal lahir</label>
        <input
          id="tanggal_lahir"
          type="date"
          value={form.tanggal_lahir || ''}
          onChange={(event) => updateField('tanggal_lahir', event.target.value)}
        />
        <p className="field-hint">
          Bisa diisi otomatis dari NIK. Kategori umur dihitung dari tanggal lahir + status
          pernikahan (menu Informasi → Kategori Umur).
        </p>
      </div>
      <div className="field">
        <label htmlFor="status_pernikahan">Status pernikahan</label>
        <SearchableSelect
          id="status_pernikahan"
          value={form.status_pernikahan || ''}
          onChange={(next) => updateField('status_pernikahan', next || null)}
          placeholder="Pilih status"
          options={toValueOptions(statusPernikahanOptions, 'Pilih status')}
        />
      </div>
      <div className="field">
        <label htmlFor="pekerjaan_id">Pekerjaan</label>
        <SearchableSelect
          id="pekerjaan_id"
          value={form.pekerjaan_id ? String(form.pekerjaan_id) : ''}
          onChange={(next) => onPekerjaanChange(Number(next) || null)}
          placeholder="Pilih pekerjaan"
          options={[
            { value: '', label: 'Pilih pekerjaan' },
            ...pekerjaanOptions.map((item) => ({
              value: String(item.id),
              label: item.name,
            })),
          ]}
        />
      </div>
      <div className="field">
        <label htmlFor="golongan_darah">Golongan darah</label>
        <SearchableSelect
          id="golongan_darah"
          value={form.golongan_darah || ''}
          onChange={(next) => updateField('golongan_darah', next || null)}
          placeholder="Pilih golongan darah"
          options={toValueOptions(golonganDarahOptions, 'Pilih golongan darah')}
        />
      </div>
      <div className="field" style={{ gridColumn: '1 / -1' }}>
        <label id="dapukan_ids_label">Dapukan (sesuai tingkatan)</label>
        {dapukanError && <p className="field-hint field-hint--error">{dapukanError}</p>}
        {dapukanList.length === 0 ? (
          <p className="field-hint">
            {dapukanError
              ? 'Daftar dapukan tidak dapat dimuat.'
              : 'Hanya admin yang dapat menetapkan dapukan; opsi mengikuti tingkatan akun Anda.'}
          </p>
        ) : (
          <div className="checkbox-grid" role="group" aria-labelledby="dapukan_ids_label">
            {dapukanList.map((item) => {
              const locked = item.slug === JAMAHA_KELOMPOK_DAPUKAN_SLUG
              const checked =
                locked && form.kelompok_id
                  ? true
                  : normalizeDapukanIds(form.dapukan_ids).includes(item.id)
              return (
                <label
                  key={item.id}
                  className={`checkbox-item${locked ? ' checkbox-item--locked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={locked}
                    onChange={() => onToggleDapukan(item.id)}
                  />
                  <span>
                    {item.nama}
                    <span className="checkbox-item__meta"> ({item.tingkat})</span>
                    {locked ? (
                      <span className="checkbox-item__meta"> — otomatis dari kelompok</span>
                    ) : null}
                  </span>
                </label>
              )
            })}
          </div>
        )}
        <p className="field-hint">
          Dapukan Jamaah Kelompok terisi otomatis saat kelompok dipilih dan tidak dapat dilepas.
          Admin dapat menambah dapukan lain setingkat atau di bawah tingkatan akun.
        </p>
      </div>
      <div className="field">
        <label htmlFor="pendidikan">Pendidikan</label>
        <SearchableSelect
          id="pendidikan"
          value={form.pendidikan || ''}
          onChange={(next) => updateField('pendidikan', next || null)}
          placeholder="Pilih pendidikan"
          options={toValueOptions(pendidikanOptions, 'Pilih pendidikan')}
        />
      </div>
      <div className="field">
        <label htmlFor="no_hp">No. HP</label>
        <input
          id="no_hp"
          value={form.no_hp}
          onChange={(event) => updateField('no_hp', event.target.value)}
          required
          aria-invalid={isFieldInvalid('no_hp')}
        />
        {fieldMessage('no_hp') && (
          <p className="field-hint field-hint--error">{fieldMessage('no_hp')}</p>
        )}
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={form.email || ''}
          onChange={(event) => updateField('email', event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="status">Status</label>
        <SearchableSelect
          id="status"
          value={form.status ?? ''}
          onChange={(next) => updateField('status', next as 'aktif' | 'nonaktif')}
          options={[
            { value: 'aktif', label: 'Aktif' },
            { value: 'nonaktif', label: 'Nonaktif' },
          ]}
        />
      </div>
    </div>
  )
}
