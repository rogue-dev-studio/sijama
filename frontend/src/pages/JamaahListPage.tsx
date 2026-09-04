/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:30:00
 */

import { useEffect, useState, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { jamaahService, masterKelompokService } from '../api/services'
import type { Jamaah, Kelompok } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import {
  SimpleMasterListPage,
  type GatedColumn,
  type MasterListParams,
} from '../components/SimpleMasterListPage'
import { SearchableSelect } from '../components/SearchableSelect'
import { PermissionLink } from '../components/PermissionLink'
import { useToast } from '../components/ToastProvider'
import { useConfirm } from '../components/ConfirmDialogProvider'
import { KATEGORI_UMUR_OPTIONS, kategoriUmurLabel } from '../lib/jamaahOptions'
import { listButtonAccess } from '../lib/listUiAccess'

const COLUMNS: GatedColumn<Jamaah>[] = [
  {
    key: 'nama',
    label: 'Nama',
    sortKey: 'nama',
    cell: (item) => item.nama,
    exportValue: (item) => item.nama,
  },
  {
    key: 'wilayah_fung_kelompok',
    label: 'Kelompok',
    sortKey: 'wilayah_fung_kelompok',
    cell: (item) => item.wilayah_fung_kelompok?.nama || '—',
    exportValue: (item) => item.wilayah_fung_kelompok?.nama || '—',
  },
  {
    key: 'kategori',
    label: 'Kategori',
    sortKey: 'kategori_umur',
    cell: (item) => item.kategori_umur_label || kategoriUmurLabel(item.kategori_umur),
    exportValue: (item) => item.kategori_umur_label || kategoriUmurLabel(item.kategori_umur),
  },
  {
    key: 'nik',
    label: 'NIK',
    sortKey: 'nik',
    cell: (item) => item.nik || '—',
    exportValue: (item) => item.nik || '—',
  },
  {
    key: 'kontak',
    label: 'Kontak',
    sortKey: 'kontak',
    cell: (item) => (
      <>
        {item.no_hp}
        {item.email ? ` · ${item.email}` : ''}
      </>
    ),
    exportValue: (item) => [item.no_hp, item.email].filter(Boolean).join(' · ') || '—',
  },
  {
    key: 'status',
    label: 'Status',
    sortKey: 'status',
    cell: (item) => (
      <span className={`badge ${item.status === 'aktif' ? 'badge--ok' : 'badge--muted'}`}>
        {item.status}
      </span>
    ),
    exportValue: (item) => item.status,
  },
  {
    key: 'wajah',
    label: 'Wajah',
    sortKey: 'face',
    cell: (item) => (
      <span className={`badge ${item.face_enrolled ? 'badge--ok' : 'badge--muted'}`}>
        {item.face_enrolled ? 'Terdaftar' : 'Belum'}
      </span>
    ),
    exportValue: (item) => (item.face_enrolled ? 'Terdaftar' : 'Belum'),
  },
]

export function JamaahListPage() {
  const { can } = useAuth()
  const { notifyDeleted } = useToast()
  const { confirm } = useConfirm()
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [faceFilter, setFaceFilter] = useState('')
  const [kelompokFilter, setKelompokFilter] = useState(0)
  const [kategoriUmurFilter, setKategoriUmurFilter] = useState('')
  const [reloadNonce, setReloadNonce] = useState(0)

  const updateAccess = listButtonAccess(can, 'jamaah', 'update')
  const deleteAccess = listButtonAccess(can, 'jamaah', 'delete')
  const faceAccess = listButtonAccess(can, 'jamaah', 'enroll_face', 'jamaah.enroll_face')

  useEffect(() => {
    let active = true
    void masterKelompokService.list({ per_page: 100 }).then((result) => {
      if (active) setKelompokList(result.items)
    })
    return () => {
      active = false
    }
  }, [])

  function clearExtraFilters() {
    setStatusFilter('')
    setFaceFilter('')
    setKelompokFilter(0)
    setKategoriUmurFilter('')
  }

  async function handleDelete(item: Jamaah) {
    const ok = await confirm({
      title: 'Konfirmasi hapus',
      message: `Hapus jamaah "${item.nama}"? Tindakan ini tidak bisa dibatalkan.`,
    })
    if (!ok) return
    await jamaahService.remove(item.id)
    notifyDeleted('jamaah')
    setReloadNonce((value) => value + 1)
  }

  function renderRowActions(item: Jamaah): ReactNode {
    return (
      <div className="data-table__actions">
        {updateAccess.visible && (
          <PermissionLink
            to={`/jamaah/${item.id}/edit`}
            enabled={updateAccess.enabled}
            className="btn btn--secondary btn--small"
          >
            Edit
          </PermissionLink>
        )}
        {faceAccess.visible && (
          <PermissionLink
            to={`/jamaah/${item.id}/face`}
            enabled={faceAccess.enabled}
            className="btn btn--secondary btn--small"
          >
            Wajah
          </PermissionLink>
        )}
        {deleteAccess.visible && (
          <button
            type="button"
            className="btn btn--danger btn--small"
            disabled={!deleteAccess.enabled}
            onClick={() => void handleDelete(item).catch((err) => {
              throw err instanceof ApiError ? err : new Error('Gagal menghapus jamaah')
            })}
          >
            Hapus
          </button>
        )}
      </div>
    )
  }

  const hasExtraFilters =
    statusFilter !== '' || faceFilter !== '' || kelompokFilter > 0 || kategoriUmurFilter !== ''

  return (
    <SimpleMasterListPage<Jamaah>
      title="Jamaah"
      description="Kelola data jamaah dan pendaftaran wajah."
      entityLabel="jamaah"
      basePath="/jamaah"
      permissionPrefix="jamaah"
      createLabel="Tambah jamaah"
      dokumenKey="jamaah"
      searchPlaceholder="Cari nama, NIK, email, atau HP…"
      columns={COLUMNS}
      showStatusFilter={false}
      showStatusColumn={false}
      extraFilterParams={{
        status: statusFilter || undefined,
        face: faceFilter || undefined,
        wilayah_fung_kelompok_id: kelompokFilter || undefined,
        kategori_umur: kategoriUmurFilter || undefined,
        _reload: reloadNonce || undefined,
      }}
      hasExtraFilters={hasExtraFilters}
      onClearExtraFilters={clearExtraFilters}
      filterPrimary={[
        <div className="field" key="status">
          <label htmlFor="filter_status">Status</label>
          <SearchableSelect
            id="filter_status"
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Semua"
            options={[
              { value: '', label: 'Semua' },
              { value: 'aktif', label: 'Aktif' },
              { value: 'nonaktif', label: 'Nonaktif' },
            ]}
          />
        </div>,
        <div className="field" key="face">
          <label htmlFor="filter_face">Wajah</label>
          <SearchableSelect
            id="filter_face"
            value={faceFilter}
            onChange={setFaceFilter}
            placeholder="Semua"
            options={[
              { value: '', label: 'Semua' },
              { value: 'enrolled', label: 'Terdaftar' },
              { value: 'pending', label: 'Belum' },
            ]}
          />
        </div>,
        <div className="field" key="kelompok">
          <label htmlFor="filter_kelompok">Kelompok</label>
          <SearchableSelect
            id="filter_kelompok"
            value={kelompokFilter ? String(kelompokFilter) : ''}
            onChange={(next) => setKelompokFilter(Number(next) || 0)}
            placeholder="Semua"
            options={[
              { value: '', label: 'Semua' },
              ...kelompokList.map((item) => ({ value: String(item.id), label: item.nama })),
            ]}
          />
        </div>,
      ]}
      filterSecondary={
        <div className="field">
          <label htmlFor="filter_kategori_umur">Kategori umur</label>
          <SearchableSelect
            id="filter_kategori_umur"
            value={kategoriUmurFilter}
            onChange={setKategoriUmurFilter}
            placeholder="Semua"
            options={[
              { value: '', label: 'Semua' },
              ...KATEGORI_UMUR_OPTIONS.map((option) => ({
                value: String(option.value),
                label: option.label,
              })),
            ]}
          />
        </div>
      }
      filterSecondaryActive={kategoriUmurFilter !== ''}
      list={async (params: MasterListParams) => {
        const { _reload: _ignored, ...apiParams } = params
        return jamaahService.list(apiParams)
      }}
      remove={async () => Promise.resolve()}
      canDeleteItem={() => false}
      renderRowActions={renderRowActions}
    />
  )
}
