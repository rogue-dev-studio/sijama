/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 16:57:14
 */

import { masterKategoriKegiatanService } from '../api/services'
import type { KategoriKegiatan } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

export function MasterKategoriKegiatanPage() {
  return (
    <SimpleMasterListPage<KategoriKegiatan>
      title="Master Kategori Kegiatan"
      description="Kelola kategori kegiatan dan warna tampilan di kalender."
      entityLabel="kategori kegiatan"
      basePath="/master/kategori-kegiatan"
      permissionPrefix="kategori_kegiatan"
      createLabel="Tambah kategori"
      list={masterKategoriKegiatanService.list}
      remove={masterKategoriKegiatanService.remove}
      renderExtraHeaders={() => <th>Warna</th>}
      renderExtraCells={(item) => (
        <td>
          <span className="calendar-legend__item">
            <span
              className="calendar-legend__swatch"
              style={{ backgroundColor: item.calendar_color || '#2563eb' }}
            />
            {item.calendar_color || '#2563eb'}
          </span>
        </td>
      )}
    />
  )
}
