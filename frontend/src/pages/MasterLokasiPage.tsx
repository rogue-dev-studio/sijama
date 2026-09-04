/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { masterLokasiService } from '../api/services'
import type { Lokasi, LokasiJenis } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'
import { ShareSocialActions } from '../components/ShareSocialActions'
import { useToast } from '../components/ToastProvider'
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
    [item.wilayah_adm_desa?.nama, item.wilayah_adm_kecamatan?.nama, item.wilayah_adm_kabupaten_kota?.nama]
      .filter(Boolean)
      .join(', ') ||
    item.kota ||
    '—'
  )
}

export function MasterLokasiPage() {
  const { notifySuccess, notifyError } = useToast()

  async function handleCopyMaps(item: Lokasi) {
    if (!isValidCoords(item.lat, item.lng)) return
    const url = buildGoogleMapsShareUrl(item.lat as number, item.lng as number, {
      name: item.maps_place_name || item.nama,
      placeId: item.maps_place_id,
      mapsUrl: item.maps_url,
    })
    const ok = await copyText(url)
    if (ok) {
      notifySuccess(`Tautan Maps "${item.nama}" disalin.`)
    } else {
      notifyError('Gagal menyalin tautan Maps.')
    }
  }

  const columns: GatedColumn<Lokasi>[] = [
    {
      key: 'nama',
      label: 'Nama',
      cell: (item) => item.nama,
      exportValue: (item) => item.nama,
    },
    {
      key: 'jenis',
      label: 'Jenis',
      cell: (item) => jenisLabel(item.jenis),
      exportValue: (item) => jenisLabel(item.jenis),
    },
    {
      key: 'wilayah',
      label: 'Wilayah',
      sortable: false,
      cell: (item) => wilayahLabel(item),
      exportValue: (item) => wilayahLabel(item),
    },
    {
      key: 'maps',
      label: 'Maps',
      sortable: false,
      cell: (item) =>
        isValidCoords(item.lat, item.lng) ? (
          <div className="data-table__actions">
            <a
              className="btn btn--secondary btn--small"
              href={buildGoogleMapsShareUrl(item.lat as number, item.lng as number, {
                name: item.maps_place_name || item.nama,
                placeId: item.maps_place_id,
                mapsUrl: item.maps_url,
              })}
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
            <ShareSocialActions
              title={item.nama}
              body={`Lokasi: ${item.nama}`}
              url={buildGoogleMapsShareUrl(item.lat as number, item.lng as number, {
                name: item.maps_place_name || item.nama,
                placeId: item.maps_place_id,
                mapsUrl: item.maps_url,
              })}
              size="small"
            />
          </div>
        ) : (
          '—'
        ),
      exportValue: (item) =>
        isValidCoords(item.lat, item.lng)
          ? buildGoogleMapsShareUrl(item.lat as number, item.lng as number, {
              name: item.maps_place_name || item.nama,
              placeId: item.maps_place_id,
              mapsUrl: item.maps_url,
            })
          : '—',
    },
    {
      key: 'is_active',
      label: 'Status',
      cell: (item) => (
        <span className={`badge ${item.is_active !== false ? 'badge--ok' : 'badge--muted'}`}>
          {item.is_active !== false ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
      exportValue: (item) => (item.is_active !== false ? 'Aktif' : 'Nonaktif'),
    },
  ]

  return (
    <>
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
        columns={columns}
      />
    </>
  )
}
