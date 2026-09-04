/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:21:51
 */

import { masterPusatService } from '../api/services'
import type { Pusat, PusatInput } from '../api/types'
import { SimpleMasterKodeFormPage } from '../components/SimpleMasterKodeFormPage'

const emptyForm: PusatInput = {
  kode: '',
  nama: '',
  deskripsi: '',
  is_active: true,
}

function toForm(item: Pusat): PusatInput {
  return {
    kode: item.kode,
    nama: item.nama,
    deskripsi: item.deskripsi || '',
    is_active: item.is_active,
  }
}

export function MasterPusatFormPage() {
  return (
    <SimpleMasterKodeFormPage
      entityLabel="pusat"
      description="Kelola wilayah pusat sebagai induk tertinggi hierarki SIJAMA."
      listPath="/master/wilayah-fung/pusat"
      emptyForm={emptyForm}
      get={masterPusatService.get}
      create={masterPusatService.create}
      update={masterPusatService.update}
      toForm={toForm}
      permissionPrefix="wilayah_fung_pusat"
    />
  )
}
