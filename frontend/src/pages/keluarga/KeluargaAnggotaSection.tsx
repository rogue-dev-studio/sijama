/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:40:00
 */

import type { KeluargaAnggotaInput, KeluargaJamaahOption, LookupOption } from '../../api/types'
import { SearchableSelect } from '../../components/SearchableSelect'

export type AnggotaRow = KeluargaAnggotaInput & { key: string }

type KeluargaAnggotaSectionProps = {
  rows: AnggotaRow[]
  kepalaJamaahId: number
  jamaahOptions: KeluargaJamaahOption[]
  hubunganOptions: LookupOption[]
  onAdd: () => void
  onUpdate: (key: string, patch: Partial<AnggotaRow>) => void
  onRemove: (key: string) => void
}

function jamaahLabel(item: KeluargaJamaahOption): string {
  return item.nama + (item.nik ? ` · ${item.nik}` : '')
}

export function KeluargaAnggotaSection({
  rows,
  kepalaJamaahId,
  jamaahOptions,
  hubunganOptions,
  onAdd,
  onUpdate,
  onRemove,
}: KeluargaAnggotaSectionProps) {
  const hubunganSelectOptions = hubunganOptions
    .filter((item) => item.value && item.value !== 'kepala')
    .map((item) => ({ value: item.value as string, label: item.name }))

  const hasHubunganOptions = hubunganSelectOptions.length > 0

  function optionsForRow(row: AnggotaRow) {
    const reserved = new Set<number>([
      kepalaJamaahId,
      ...rows
        .filter((item) => item.key !== row.key && item.jamaah_id > 0)
        .map((item) => item.jamaah_id),
    ])

    return jamaahOptions.filter((item) => !reserved.has(item.id) || item.id === row.jamaah_id)
  }

  const canAddMore =
    jamaahOptions.filter((item) => item.id !== kepalaJamaahId).length > rows.length

  return (
    <>
      {rows.length === 0 ? (
        <div className="empty-state empty-state--inline">
          Belum ada anggota tambahan selain kepala keluarga.
        </div>
      ) : (
        <div className="form-repeat-list">
          {rows.map((row, index) => {
            const rowOptions = optionsForRow(row)
            return (
              <div key={row.key} className="form-repeat-item">
                <div className="form-repeat-item__head">
                  <span className="badge badge--muted">Anggota {index + 1}</span>
                </div>
                <div className="form-grid form-grid--2">
                  <div className="field">
                    <label htmlFor={`anggota-jamaah-${row.key}`}>Jamaah</label>
                    <SearchableSelect
                      id={`anggota-jamaah-${row.key}`}
                      value={row.jamaah_id ? String(row.jamaah_id) : ''}
                      onChange={(next) => onUpdate(row.key, { jamaah_id: Number(next) || 0 })}
                      placeholder="Pilih jamaah"
                      options={[
                        { value: '', label: 'Pilih jamaah' },
                        ...rowOptions.map((item) => ({
                          value: String(item.id),
                          label: jamaahLabel(item),
                        })),
                      ]}
                    />
                    {rowOptions.length === 0 && (
                      <p className="field-hint field-hint--error">
                        Tidak ada jamaah tersedia. Semua sudah terdaftar di keluarga lain atau dipakai di baris lain.
                      </p>
                    )}
                  </div>
                  <div className="field">
                    <label htmlFor={`anggota-hubungan-${row.key}`}>Hubungan keluarga</label>
                    <SearchableSelect
                      id={`anggota-hubungan-${row.key}`}
                      value={row.hubungan_keluarga}
                      onChange={(next) => onUpdate(row.key, { hubungan_keluarga: next })}
                      placeholder="Pilih hubungan"
                      disabled={!hasHubunganOptions}
                      options={hubunganSelectOptions}
                    />
                    {!hasHubunganOptions && (
                      <p className="field-hint field-hint--error">
                        Data hubungan keluarga belum tersedia. Tambahkan di Master → Lookup (tipe{' '}
                        <code>hubungan_keluarga</code>).
                      </p>
                    )}
                  </div>
                  <div className="field field--full">
                    <label htmlFor={`anggota-catatan-${row.key}`}>Catatan (opsional)</label>
                    <input
                      id={`anggota-catatan-${row.key}`}
                      value={row.catatan || ''}
                      onChange={(event) => onUpdate(row.key, { catatan: event.target.value })}
                      placeholder="Keterangan tambahan"
                    />
                  </div>
                </div>
                <div className="form-repeat-item__foot">
                  <button
                    type="button"
                    className="btn btn--secondary btn--small"
                    onClick={() => onRemove(row.key)}
                  >
                    Hapus anggota
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="form-section-actions">
        <button
          type="button"
          className="btn btn--secondary btn--small"
          onClick={onAdd}
          disabled={!canAddMore}
        >
          + Tambah anggota
        </button>
        {!canAddMore && jamaahOptions.length > 0 && (
          <p className="field-hint">Semua jamaah tersedia sudah ditambahkan.</p>
        )}
      </div>
    </>
  )
}

export function newAnggotaRow(): AnggotaRow {
  return {
    key: crypto.randomUUID(),
    jamaah_id: 0,
    hubungan_keluarga: 'anak',
    is_kepala_keluarga: false,
    catatan: null,
  }
}
