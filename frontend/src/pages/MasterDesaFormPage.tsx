/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:29:10
 */

import { masterDaerahService, masterDesaService } from '../api/services'
import type { Desa, DesaInput } from '../api/types'
import { SimpleMasterKodeFormPage } from '../components/SimpleMasterKodeFormPage'

const emptyForm: DesaInput = {
  daerah_id: 0,
  kode: '',
  nama: '',
  deskripsi: '',
  is_active: true,
}

function toForm(item: Desa): DesaInput {
  return {
    daerah_id: item.daerah_id,
    kode: item.kode,
    nama: item.nama,
    deskripsi: item.deskripsi || '',
    is_active: item.is_active,
  }
}

const parentSelect = {
  field: 'daerah_id' as const,
  label: 'Daerah',
  emptyMessage: 'Tambahkan daerah terlebih dahulu.',
  loadOptions: async () => {
    const result = await masterDaerahService.list({ per_page: 100 })
    return result.items.map((item) => ({ id: item.id, nama: item.nama }))
  },
}

export function MasterDesaFormPage() {
  return (
    <SimpleMasterKodeFormPage
      entityLabel="desa"
      description="Kelola wilayah desa per daerah dalam hierarki SIJAMA."
      listPath="/master/desa"
      emptyForm={emptyForm}
      get={masterDesaService.get}
      create={masterDesaService.create}
      update={masterDesaService.update}
      toForm={toForm}
      parentSelect={parentSelect}
    />
  )
}
