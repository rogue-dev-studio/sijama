/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:41:12
 */

import { admKabupatenKotaService, admKecamatanService } from '../api/services'
import type { AdmKecamatan, AdmKecamatanInput } from '../api/types'
import { SimpleMasterKodeFormPage } from '../components/SimpleMasterKodeFormPage'

const emptyForm: AdmKecamatanInput = {
  wilayah_adm_kabupaten_kota_id: 0,
  kode: '',
  nama: '',
  is_active: true,
}

function toForm(item: AdmKecamatan): AdmKecamatanInput {
  return {
    wilayah_adm_kabupaten_kota_id: item.wilayah_adm_kabupaten_kota_id,
    kode: item.kode,
    nama: item.nama,
    is_active: item.is_active,
  }
}

const parentSelect = {
  field: 'wilayah_adm_kabupaten_kota_id' as const,
  label: 'Kabupaten/Kota',
  emptyMessage: 'Tambahkan kabupaten/kota terlebih dahulu.',
  loadOptions: async () => {
    const result = await admKabupatenKotaService.list({ per_page: 500 })
    return result.items.map((item) => ({
      id: item.id,
      nama: item.wilayah_adm_provinsi
        ? `${item.nama} · ${item.wilayah_adm_provinsi.nama}`
        : `${item.nama} (${item.jenis})`,
    }))
  },
}

export function MasterAdmKecamatanFormPage() {
  return (
    <SimpleMasterKodeFormPage
      entityLabel="kecamatan"
      description="Kelola kecamatan per kabupaten/kota."
      listPath="/master/wilayah-adm/kecamatan"
      emptyForm={emptyForm}
      get={admKecamatanService.get}
      create={admKecamatanService.create}
      update={admKecamatanService.update}
      toForm={toForm}
      showDeskripsi={false}
      parentSelect={parentSelect}
      permissionPrefix="wilayah_adm_kecamatan"
    />
  )
}
