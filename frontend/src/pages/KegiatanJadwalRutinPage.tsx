/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 18:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:30:00
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { kegiatanJadwalRutinService, lookupOptionsService } from '../api/services'
import type { KegiatanJadwalRutin, LookupOption } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import {
  SimpleMasterListPage,
  type GatedColumn,
  type MasterListParams,
} from '../components/SimpleMasterListPage'
import { PermissionLink } from '../components/PermissionLink'
import { useToast } from '../components/ToastProvider'
import { useConfirm } from '../components/ConfirmDialogProvider'
import { hariMingguLabel } from '../lib/hariMinggu'
import { listButtonAccess } from '../lib/listUiAccess'
import { LOOKUP_TYPE } from '../lib/lookupTypes'

const FREKUENSI_LABEL: Record<string, string> = {
  mingguan: 'Mingguan',
  bulanan: 'Bulanan',
  tahunan: 'Tahunan',
}

function scopeLabel(item: KegiatanJadwalRutin): string {
  if (item.scope_level === 'kelompok') return item.wilayah_fung_kelompok?.nama ?? 'Kelompok'
  if (item.scope_level === 'desa') return item.wilayah_fung_desa?.nama ?? 'Desa'
  return item.wilayah_fung_daerah?.nama ?? 'Daerah'
}

function recurrenceLabel(item: KegiatanJadwalRutin, hariOptions: LookupOption[]): string {
  if (item.frekuensi === 'mingguan') {
    return `Setiap ${hariMingguLabel(item.day_of_week, hariOptions)}`
  }
  if (item.frekuensi === 'bulanan') {
    return `Tanggal ${item.day_of_month ?? '—'} setiap bulan`
  }
  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${item.day_of_month ?? '—'} ${months[item.month_of_year ?? 0] ?? ''}`.trim()
}

function buildColumns(hariOptions: LookupOption[]): GatedColumn<KegiatanJadwalRutin>[] {
  return [
    {
      key: 'judul',
      label: 'Judul',
      sortKey: 'judul',
      cell: (item) => item.judul,
      exportValue: (item) => item.judul,
    },
    {
      key: 'frekuensi',
      label: 'Frekuensi',
      sortKey: 'frekuensi',
      cell: (item) => FREKUENSI_LABEL[item.frekuensi] ?? item.frekuensi,
      exportValue: (item) => FREKUENSI_LABEL[item.frekuensi] ?? item.frekuensi,
    },
    {
      key: 'pola',
      label: 'Pola',
      sortKey: 'effective_from',
      cell: (item) => recurrenceLabel(item, hariOptions),
      exportValue: (item) => recurrenceLabel(item, hariOptions),
    },
    {
      key: 'cakupan',
      label: 'Cakupan',
      sortKey: 'scope_level',
      cell: (item) => `${item.scope_level} · ${scopeLabel(item)}`,
      exportValue: (item) => `${item.scope_level} · ${scopeLabel(item)}`,
    },
    {
      key: 'effective_from',
      label: 'Berlaku dari',
      sortKey: 'effective_from',
      cell: (item) => new Date(item.effective_from).toLocaleDateString('id-ID'),
      exportValue: (item) => new Date(item.effective_from).toLocaleDateString('id-ID'),
    },
    {
      key: 'is_active',
      label: 'Status',
      sortKey: 'is_active',
      cell: (item) => (item.is_active ? 'Aktif' : 'Nonaktif'),
      exportValue: (item) => (item.is_active ? 'Aktif' : 'Nonaktif'),
    },
  ]
}

export function KegiatanJadwalRutinPage() {
  const { can } = useAuth()
  const { notifyDeleted } = useToast()
  const { confirm } = useConfirm()
  const [hariMingguOptions, setHariMingguOptions] = useState<LookupOption[]>([])
  const [reloadNonce, setReloadNonce] = useState(0)

  const createAccess = listButtonAccess(can, 'kegiatan', 'create')
  const updateAccess = listButtonAccess(can, 'kegiatan', 'update')
  const columns = useMemo(() => buildColumns(hariMingguOptions), [hariMingguOptions])

  useEffect(() => {
    let active = true
    void lookupOptionsService.byTypes([LOOKUP_TYPE.HARI_MINGGU]).then((result) => {
      if (active) setHariMingguOptions(result[LOOKUP_TYPE.HARI_MINGGU] ?? [])
    })
    return () => {
      active = false
    }
  }, [])

  async function handleDeactivate(id: number) {
    const ok = await confirm({
      title: 'Nonaktifkan jadwal',
      message:
        'Jadwal lama akan dinonaktifkan dan tidak lagi menghasilkan kegiatan baru. Kegiatan yang sudah terbuat tetap ada. Lanjutkan?',
    })
    if (!ok) return
    await kegiatanJadwalRutinService.deactivate(id)
    notifyDeleted('jadwal rutin kegiatan')
    setReloadNonce((value) => value + 1)
  }

  async function handleGenerate(id: number) {
    const result = await kegiatanJadwalRutinService.generate(id)
    setReloadNonce((value) => value + 1)
    alert(`Berhasil membuat ${result.created} kegiatan dari jadwal.`)
  }

  function renderRowActions(item: KegiatanJadwalRutin): ReactNode {
    if (!item.is_active) return null

    return (
      <div className="data-table__actions">
        {updateAccess.visible && (
          <PermissionLink
            to={`/kegiatan/jadwal-rutin/${item.id}/edit`}
            enabled={updateAccess.enabled}
            className="btn btn--secondary btn--small"
          >
            Ubah
          </PermissionLink>
        )}
        {createAccess.visible && (
          <button
            type="button"
            className="btn btn--secondary btn--small"
            disabled={!createAccess.enabled}
            onClick={() => void handleGenerate(item.id).catch((err) => {
              throw err instanceof ApiError ? err : new Error('Gagal generate kegiatan')
            })}
          >
            Generate
          </button>
        )}
        {updateAccess.visible && (
          <button
            type="button"
            className="btn btn--danger btn--small"
            disabled={!updateAccess.enabled}
            onClick={() => void handleDeactivate(item.id).catch((err) => {
              throw err instanceof ApiError ? err : new Error('Gagal menonaktifkan jadwal')
            })}
          >
            Nonaktifkan
          </button>
        )}
      </div>
    )
  }

  return (
    <SimpleMasterListPage<KegiatanJadwalRutin>
      title="Jadwal Rutin Kegiatan"
      description="Atur kegiatan mingguan/bulanan/tahunan per daerah, desa, atau kelompok. Ubah jadwal dengan nonaktifkan yang lama lalu buat jadwal baru."
      entityLabel="jadwal rutin"
      basePath="/kegiatan/jadwal-rutin"
      permissionPrefix="kegiatan"
      createLabel="Tambah Jadwal"
      searchPlaceholder="Cari judul jadwal…"
      defaultSortBy="effective_from"
      defaultSortDir="desc"
      columns={columns}
      showStatusColumn={false}
      extraFilterParams={{ _reload: reloadNonce || undefined }}
      headerActions={
        <PermissionLink to="/kegiatan" enabled={can('kegiatan.view')} className="btn btn--ghost">
          Daftar Kegiatan
        </PermissionLink>
      }
      list={async (params: MasterListParams) => {
        const { _reload: _ignored, ...apiParams } = params
        return kegiatanJadwalRutinService.list(apiParams)
      }}
      itemLabel={(item) => item.judul}
      remove={async () => Promise.resolve()}
      canDeleteItem={() => false}
      renderRowActions={renderRowActions}
      editItemPath={(item) => `/kegiatan/jadwal-rutin/${item.id}/edit`}
    />
  )
}
