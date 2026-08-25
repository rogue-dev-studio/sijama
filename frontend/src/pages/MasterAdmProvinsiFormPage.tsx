/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:29:10
 */

import { admNegaraService, admProvinsiService } from '../api/services'
import type { AdmProvinsi, AdmProvinsiInput } from '../api/types'
import { SimpleMasterKodeFormPage } from '../components/SimpleMasterKodeFormPage'

const emptyForm: AdmProvinsiInput = {
  negara_id: 0,
  kode: '',
  nama: '',
  is_active: true,
}

function toForm(item: AdmProvinsi): AdmProvinsiInput {
  return {
    negara_id: item.negara_id,
    kode: item.kode,
    nama: item.nama,
    is_active: item.is_active,
  }
}

const parentSelect = {
  field: 'negara_id' as const,
  label: 'Negara',
  emptyMessage: 'Tambahkan negara terlebih dahulu.',
  loadOptions: async () => {
    const result = await admNegaraService.list({ per_page: 100 })
    return result.items.map((item) => ({ id: item.id, nama: item.nama }))
  },
}

export function MasterAdmProvinsiFormPage() {
  return (
    <SimpleMasterKodeFormPage
      entityLabel="provinsi"
      description="Kelola provinsi per negara dalam wilayah administrasi."
      listPath="/master/adm/provinsi"
      emptyForm={emptyForm}
      get={admProvinsiService.get}
      create={admProvinsiService.create}
      update={admProvinsiService.update}
      toForm={toForm}
      showDeskripsi={false}
      parentSelect={parentSelect}
    />
  )
}
