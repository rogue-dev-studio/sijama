/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:45:00
 */

import { useState } from 'react'
import { masterLokasiService } from '../api/services'
import type { Lokasi, LokasiJenis } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'
import { buildGoogleMapsShareUrl, copyText, isValidCoords } from '../lib/googleMaps'

const JENIS_OPTIONS: { value: LokasiJenis; label: string }[] = [
  { value: 'masjid', label: 'Masjid LDII' },
  { value: 'gsg', label: 'Gedung Serbaguna (GSG)' },
  { value: 'ppm', label: 'PPM' },
  { value: 'aula', label: 'Aula' },
  { value: 'kantor', label: 'Kantor DPW/DPD/DPP' },
  { value: 'lainnya', label: 'Lainnya' },
]

function jenisLabel(jenis: string): string {
  return JENIS_OPTIONS.find((option) => option.value === jenis)?.label || jenis
}

function wilayahLabel(item: Lokasi): string {
  return (
    [item.adm_desa_kelurahan?.nama, item.adm_kecamatan?.nama, item.adm_kabupaten_kota?.nama]
      .filter(Boolean)
      .join(', ') ||
    item.kota ||
    '—'
  )
}

export function MasterLokasiPage() {
  const [copyHint, setCopyHint] = useState<string | null>(null)

  async function handleCopyMaps(item: Lokasi) {
    if (!isValidCoords(item.lat, item.lng)) return
    const url = buildGoogleMapsShareUrl(item.lat as number, item.lng as number)
    const ok = await copyText(url)
    setCopyHint(ok ? `Tautan Maps "${item.nama}" disalin.` : 'Gagal menyalin tautan Maps.')
  }

  return (
    <>
      {copyHint && <div className="alert alert--success">{copyHint}</div>}
      <SimpleMasterListPage<Lokasi>
        title="Master Lokasi"
        description="Lokasi kegiatan terhubung ke master wilayah administrasi."
        entityLabel="lokasi"
        basePath="/master/lokasi"
        permissionPrefix="lokasi"
        createLabel="Tambah lokasi"
        list={masterLokasiService.list}
        remove={masterLokasiService.remove}
        selectFilter={{
          label: 'Jenis',
          paramKey: 'jenis',
          options: JENIS_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          })),
        }}
        renderExtraHeaders={() => (
          <>
            <th>Jenis</th>
            <th>Wilayah</th>
            <th>Maps</th>
          </>
        )}
        renderExtraCells={(item) => (
          <>
            <td>{jenisLabel(item.jenis)}</td>
            <td>{wilayahLabel(item)}</td>
            <td>
              {isValidCoords(item.lat, item.lng) ? (
                <div className="data-table__actions">
                  <a
                    className="btn btn--secondary btn--small"
                    href={buildGoogleMapsShareUrl(item.lat as number, item.lng as number)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Buka
                  </a>
                  <button
                    type="button"
                    className="btn btn--secondary btn--small"
                    onClick={() => void handleCopyMaps(item)}
                  >
                    Salin
                  </button>
                </div>
              ) : (
                '—'
              )}
            </td>
          </>
        )}
      />
    </>
  )
}
