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
  wilayah_adm_negara_id: 0,
  kode: '',
  nama: '',
  singkatan: null,
  is_active: true,
}

function toForm(item: AdmProvinsi): AdmProvinsiInput {
  return {
    wilayah_adm_negara_id: item.wilayah_adm_negara_id,
    kode: item.kode,
    nama: item.nama,
    singkatan: item.singkatan,
    is_active: item.is_active,
  }
}

const parentSelect = {
  field: 'wilayah_adm_negara_id' as const,
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
      listPath="/master/wilayah-adm/provinsi"
      emptyForm={emptyForm}
      get={admProvinsiService.get}
      create={admProvinsiService.create}
      update={admProvinsiService.update}
      toForm={toForm}
      showDeskripsi={false}
      parentSelect={parentSelect}
      permissionPrefix="wilayah_adm_provinsi"
      renderExtraFields={(form, setForm, _isEdit, fieldAccess) => {
        const access = fieldAccess('singkatan')
        if (!access.visible) return null
        return (
          <div className="field">
            <label htmlFor="singkatan">Singkatan SNI</label>
            <input
              id="singkatan"
              maxLength={8}
              value={form.singkatan || ''}
              onChange={(event) =>
                setForm({
                  ...form,
                  singkatan: event.target.value.toUpperCase() || null,
                })
              }
              placeholder="ID-JB"
              disabled={!access.enabled}
            />
          </div>
        )
      }}
    />
  )
}
