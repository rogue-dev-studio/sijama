/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:23:49
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:23:49
 */

import { masterLookupService } from '../api/services'
import type { LookupM } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

export function MasterLookupPage() {
  return (
    <SimpleMasterListPage<LookupM>
      title="Master Lookup"
      description="Kelola data referensi generik (lookup_m). Tipe baku untuk form jamaah: pekerjaan, jenis_kelamin, golongan_darah, status_pernikahan, pendidikan."
      entityLabel="lookup"
      basePath="/master/lookup"
      permissionPrefix="lookup"
      createLabel="Tambah lookup"
      list={masterLookupService.list}
      remove={masterLookupService.remove}
      searchPlaceholder="Cari tipe, nama, value, atau kode…"
      itemLabel={(item) => item.lookup_name || item.lookup_value || item.lookup_kode || `#${item.id}`}
      renderLeadingHeaders={() => <th>Tipe</th>}
      renderLeadingCells={(item) => <td>{item.lookup_type}</td>}
      renderExtraHeaders={() => (
        <>
          <th>Value</th>
          <th>Kode</th>
          <th>Urutan</th>
        </>
      )}
      renderExtraCells={(item) => (
        <>
          <td>{item.lookup_value || '—'}</td>
          <td>{item.lookup_kode || '—'}</td>
          <td>{item.lookup_urutan ?? '—'}</td>
        </>
      )}
    />
  )
}
