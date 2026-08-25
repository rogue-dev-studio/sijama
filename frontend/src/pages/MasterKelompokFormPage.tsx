/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:35:53
 */

import { masterDesaService, masterKelompokService } from '../api/services'
import type { Kelompok, KelompokInput } from '../api/types'
import { SimpleMasterKodeFormPage } from '../components/SimpleMasterKodeFormPage'

const emptyForm: KelompokInput = {
  desa_id: 0,
  kode: '',
  nama: '',
  deskripsi: '',
  is_active: true,
}

function toForm(item: Kelompok): KelompokInput {
  return {
    desa_id: item.desa_id,
    kode: item.kode,
    nama: item.nama,
    deskripsi: item.deskripsi || '',
    is_active: item.is_active,
  }
}

const parentSelect = {
  field: 'desa_id' as const,
  label: 'Desa',
  emptyMessage: 'Tambahkan desa terlebih dahulu.',
  loadOptions: async () => {
    const result = await masterDesaService.list({ per_page: 10000 })
    return result.items.map((item) => ({
      id: item.id,
      nama: item.daerah ? `${item.nama} · ${item.daerah.nama}` : item.nama,
    }))
  },
}

export function MasterKelompokFormPage() {
  return (
    <SimpleMasterKodeFormPage
      entityLabel="kelompok"
      description="Kelola kelompok jamaah per desa."
      listPath="/master/kelompok"
      emptyForm={emptyForm}
      get={masterKelompokService.get}
      create={masterKelompokService.create}
      update={masterKelompokService.update}
      toForm={toForm}
      parentSelect={parentSelect}
    />
  )
}
