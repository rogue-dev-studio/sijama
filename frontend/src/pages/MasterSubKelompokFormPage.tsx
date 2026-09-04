/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:35:53
 */

import { masterKelompokService, masterSubKelompokService } from '../api/services'
import type { SubKelompok, SubKelompokInput } from '../api/types'
import { SimpleMasterKodeFormPage } from '../components/SimpleMasterKodeFormPage'

const emptyForm: SubKelompokInput = {
  wilayah_fung_kelompok_id: 0,
  kode: '',
  nama: '',
  deskripsi: '',
  is_active: true,
}

function toForm(item: SubKelompok): SubKelompokInput {
  return {
    wilayah_fung_kelompok_id: item.wilayah_fung_kelompok_id,
    kode: item.kode,
    nama: item.nama,
    deskripsi: item.deskripsi || '',
    is_active: item.is_active,
  }
}

const parentSelect = {
  field: 'wilayah_fung_kelompok_id' as const,
  label: 'Kelompok',
  emptyMessage: 'Tambahkan kelompok terlebih dahulu.',
  loadOptions: async () => {
    const result = await masterKelompokService.list({ per_page: 500 })
    return result.items.map((item) => ({ id: item.id, nama: item.nama }))
  },
}

export function MasterSubKelompokFormPage() {
  return (
    <SimpleMasterKodeFormPage
      entityLabel="sub kelompok"
      description="Kelola sub kelompok di bawah kelompok."
      listPath="/master/wilayah-fung/sub-kelompok"
      emptyForm={emptyForm}
      get={masterSubKelompokService.get}
      create={masterSubKelompokService.create}
      update={masterSubKelompokService.update}
      toForm={toForm}
      parentSelect={parentSelect}
      permissionPrefix="wilayah_fung_sub_kelompok"
    />
  )
}
