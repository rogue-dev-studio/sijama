/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 16:57:14
 */

import { masterMateriService } from '../api/services'
import type { Materi, MateriInput } from '../api/types'
import { SimpleMasterNamaFormPage } from '../components/SimpleMasterNamaFormPage'

const emptyForm: MateriInput = {
  nama: '',
  deskripsi: '',
  is_active: true,
}

function toForm(item: Materi): MateriInput {
  return {
    nama: item.nama,
    deskripsi: item.deskripsi || '',
    is_active: item.is_active,
  }
}

export function MasterMateriFormPage() {
  return (
    <SimpleMasterNamaFormPage
      entityLabel="materi"
      description="Kelola materi pengajian yang dapat dipilih pada jadwal."
      listPath="/master/materi"
      emptyForm={emptyForm}
      get={masterMateriService.get}
      create={masterMateriService.create}
      update={masterMateriService.update}
      toForm={toForm}
    />
  )
}
