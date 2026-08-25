/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-01 16:56:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:21:51
 */

import { admNegaraService } from '../api/services'
import type { AdmNegara } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

export function MasterAdmNegaraPage() {
  return (
    <SimpleMasterListPage<AdmNegara>
      title="Master Negara"
      description="Kelola data wilayah administrasi negara."
      entityLabel="negara"
      basePath="/master/adm/negara"
      permissionPrefix="adm_negara"
      createLabel="Tambah negara"
      searchPlaceholder="Cari kode atau nama negara…"
      showStatusFilter={false}
      list={admNegaraService.list}
      remove={admNegaraService.remove}
      renderLeadingHeaders={() => <th>Kode</th>}
      renderLeadingCells={(item) => <td>{item.kode}</td>}
      renderExtraHeaders={() => <th>ISO3</th>}
      renderExtraCells={(item) => <td>{item.iso3 || '—'}</td>}
    />
  )
}
