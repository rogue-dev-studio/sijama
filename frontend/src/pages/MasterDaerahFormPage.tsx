/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:29:10
 */

import { masterDaerahService, masterPusatService } from '../api/services'
import type { Daerah, DaerahInput } from '../api/types'
import { SimpleMasterKodeFormPage } from '../components/SimpleMasterKodeFormPage'

const emptyForm: DaerahInput = {
  wilayah_fung_pusat_id: 0,
  kode: '',
  nama: '',
  deskripsi: '',
  is_active: true,
}

function toForm(item: Daerah): DaerahInput {
  return {
    wilayah_fung_pusat_id: item.wilayah_fung_pusat_id,
    kode: item.kode,
    nama: item.nama,
    deskripsi: item.deskripsi || '',
    is_active: item.is_active,
  }
}

const parentSelect = {
  field: 'wilayah_fung_pusat_id' as const,
  label: 'Pusat',
  emptyMessage: 'Tambahkan pusat terlebih dahulu.',
  loadOptions: async () => {
    const result = await masterPusatService.list({ per_page: 100 })
    return result.items.map((item) => ({ id: item.id, nama: item.nama }))
  },
}

export function MasterDaerahFormPage() {
  return (
    <SimpleMasterKodeFormPage
      entityLabel="daerah"
      description="Kelola wilayah daerah per pusat dalam hierarki SIJAMA."
      listPath="/master/wilayah-fung/daerah"
      emptyForm={emptyForm}
      get={masterDaerahService.get}
      create={masterDaerahService.create}
      update={masterDaerahService.update}
      toForm={toForm}
      parentSelect={parentSelect}
      permissionPrefix="wilayah_fung_daerah"
    />
  )
}
