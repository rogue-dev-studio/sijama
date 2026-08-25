/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:45:00
 */

import { masterDapukanService } from '../api/services'
import type { Dapukan } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

export function MasterDapukanPage() {
  return (
    <SimpleMasterListPage<Dapukan>
      title="Master Dapukan"
      description="Kelola peran dan tingkat akses pengguna."
      entityLabel="dapukan"
      basePath="/master/dapukan"
      permissionPrefix="dapukan"
      createLabel="Tambah dapukan"
      list={masterDapukanService.list}
      remove={masterDapukanService.remove}
      searchPlaceholder="Cari slug atau nama dapukan…"
      canDeleteItem={(item) => !item.is_system}
      renderLeadingHeaders={() => <th>Slug</th>}
      renderLeadingCells={(item) => <td>{item.slug}</td>}
      renderExtraHeaders={() => <th>Urutan</th>}
      renderExtraCells={(item) => <td>{item.urutan}</td>}
      renderStatusExtra={(item) =>
        item.is_system ? (
          <span className="badge badge--muted" style={{ marginLeft: '0.35rem' }}>
            Sistem
          </span>
        ) : null
      }
    />
  )
}
