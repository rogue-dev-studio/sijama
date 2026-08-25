/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:41:12
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:41:12
 */

import { admDesaKelurahanService, admKodePosService } from '../api/services'
import type { AdmKodePos, Paginated } from '../api/types'
import { SimpleMasterListPage, type MasterListParams } from '../components/SimpleMasterListPage'

type KodePosRow = AdmKodePos & { nama: string }

async function loadDesaKelurahanOptions() {
  const result = await admDesaKelurahanService.list({ per_page: 10000 })
  return result.items.map((item) => ({
    id: item.id,
    nama: item.kecamatan ? `${item.nama} · ${item.kecamatan.nama}` : item.nama,
  }))
}

async function listKodePos(params: MasterListParams): Promise<Paginated<KodePosRow>> {
  const result = await admKodePosService.list({
    q: typeof params.q === 'string' ? params.q : undefined,
    desa_kelurahan_id:
      typeof params.desa_kelurahan_id === 'number' ? params.desa_kelurahan_id : undefined,
    page: typeof params.page === 'number' ? params.page : undefined,
    per_page: typeof params.per_page === 'number' ? params.per_page : undefined,
  })
  return {
    ...result,
    items: result.items.map((item) => ({
      ...item,
      nama: item.nama_wilayah || item.kode,
    })),
  }
}

const parentFilter = {
  label: 'Desa/Kelurahan',
  paramKey: 'desa_kelurahan_id',
  loadOptions: loadDesaKelurahanOptions,
}

export function MasterAdmKodePosPage() {
  return (
    <SimpleMasterListPage<KodePosRow>
      title="Master Kode Pos"
      description="Kelola kode pos dan tautan ke desa/kelurahan."
      entityLabel="kode pos"
      basePath="/master/adm/kode-pos"
      permissionPrefix="adm_kode_pos"
      createLabel="Tambah kode pos"
      searchPlaceholder="Cari kode atau wilayah…"
      showStatusFilter={false}
      list={listKodePos}
      remove={admKodePosService.remove}
      parentFilter={parentFilter}
      renderLeadingHeaders={() => <th>Kode</th>}
      renderLeadingCells={(item) => <td>{item.kode}</td>}
    />
  )
}
