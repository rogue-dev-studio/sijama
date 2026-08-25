/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:35:53
 */

import { admKabupatenKotaService, admProvinsiService } from '../api/services'
import type { AdmKabupatenKota, AdmKabupatenKotaInput } from '../api/types'
import { SearchableSelect } from '../components/SearchableSelect'
import { SimpleMasterKodeFormPage } from '../components/SimpleMasterKodeFormPage'

const emptyForm: AdmKabupatenKotaInput = {
  provinsi_id: 0,
  kode: '',
  nama: '',
  jenis: 'kabupaten',
  is_active: true,
}

function toForm(item: AdmKabupatenKota): AdmKabupatenKotaInput {
  return {
    provinsi_id: item.provinsi_id,
    kode: item.kode,
    nama: item.nama,
    jenis: item.jenis,
    is_active: item.is_active,
  }
}

const parentSelect = {
  field: 'provinsi_id' as const,
  label: 'Provinsi',
  emptyMessage: 'Tambahkan provinsi terlebih dahulu.',
  loadOptions: async () => {
    const result = await admProvinsiService.list({ per_page: 10000 })
    return result.items.map((item) => ({
      id: item.id,
      nama: item.negara ? `${item.nama} · ${item.negara.nama}` : item.nama,
    }))
  },
}

export function MasterAdmKabupatenKotaFormPage() {
  return (
    <SimpleMasterKodeFormPage
      entityLabel="kabupaten/kota"
      description="Kelola kabupaten dan kota per provinsi."
      listPath="/master/adm/kabupaten-kota"
      emptyForm={emptyForm}
      get={admKabupatenKotaService.get}
      create={admKabupatenKotaService.create}
      update={admKabupatenKotaService.update}
      toForm={toForm}
      showDeskripsi={false}
      parentSelect={parentSelect}
      renderExtraFields={(form, setForm) => (
        <div className="field">
          <label htmlFor="jenis">Jenis</label>
          <SearchableSelect
            id="jenis"
            value={form.jenis}
            onChange={(next) =>
              setForm({ ...form, jenis: next === 'kota' ? 'kota' : 'kabupaten' })
            }
            options={[
              { value: 'kabupaten', label: 'Kabupaten' },
              { value: 'kota', label: 'Kota' },
            ]}
          />
        </div>
      )}
    />
  )
}
