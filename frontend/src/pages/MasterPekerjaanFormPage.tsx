/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 16:57:14
 */

import { masterPekerjaanService } from '../api/services'
import type { Pekerjaan, PekerjaanInput } from '../api/types'
import { SimpleMasterNamaFormPage } from '../components/SimpleMasterNamaFormPage'

const emptyForm: PekerjaanInput = {
  nama: '',
  deskripsi: '',
  is_active: true,
}

function toForm(item: Pekerjaan): PekerjaanInput {
  return {
    nama: item.nama,
    deskripsi: item.deskripsi || '',
    is_active: item.is_active,
  }
}

export function MasterPekerjaanFormPage() {
  return (
    <SimpleMasterNamaFormPage
      entityLabel="pekerjaan"
      description="Kelola daftar pekerjaan yang dipilih pada master jamaah."
      listPath="/master/pekerjaan"
      emptyForm={emptyForm}
      get={masterPekerjaanService.get}
      create={masterPekerjaanService.create}
      update={masterPekerjaanService.update}
      toForm={toForm}
    />
  )
}
