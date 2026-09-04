/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:41:12
 */

import { admDesaKelurahanService, admKecamatanService } from '../api/services'
import type { AdmDesaKelurahan, AdmDesaKelurahanInput } from '../api/types'
import { SearchableSelect } from '../components/SearchableSelect'
import { SimpleMasterKodeFormPage } from '../components/SimpleMasterKodeFormPage'

const emptyForm: AdmDesaKelurahanInput = {
  wilayah_adm_kecamatan_id: 0,
  kode: '',
  nama: '',
  jenis: 'desa',
  is_active: true,
}

function toForm(item: AdmDesaKelurahan): AdmDesaKelurahanInput {
  return {
    wilayah_adm_kecamatan_id: item.wilayah_adm_kecamatan_id,
    kode: item.kode,
    nama: item.nama,
    jenis: item.jenis,
    is_active: item.is_active,
  }
}

const parentSelect = {
  field: 'wilayah_adm_kecamatan_id' as const,
  label: 'Kecamatan',
  emptyMessage: 'Tambahkan kecamatan terlebih dahulu.',
  loadOptions: async () => {
    const result = await admKecamatanService.list({ per_page: 500 })
    return result.items.map((item) => ({
      id: item.id,
      nama: item.wilayah_adm_kabupaten_kota
        ? `${item.nama} · ${item.wilayah_adm_kabupaten_kota.nama}`
        : item.nama,
    }))
  },
}

export function MasterAdmDesaKelurahanFormPage() {
  return (
    <SimpleMasterKodeFormPage
      entityLabel="desa/kelurahan"
      description="Kelola desa dan kelurahan per kecamatan."
      listPath="/master/wilayah-adm/desa"
      emptyForm={emptyForm}
      get={admDesaKelurahanService.get}
      create={admDesaKelurahanService.create}
      update={admDesaKelurahanService.update}
      toForm={toForm}
      showDeskripsi={false}
      parentSelect={parentSelect}
      permissionPrefix="wilayah_adm_desa"
      renderExtraFields={(form, setForm, _isEdit, fieldAccess) => {
        const access = fieldAccess('jenis')
        if (!access.visible) return null
        return (
          <div className="field">
            <label htmlFor="jenis">Jenis</label>
            <SearchableSelect
              id="jenis"
              value={form.jenis}
              onChange={(next) =>
                setForm({
                  ...form,
                  jenis:
                    next === 'kelurahan'
                      ? 'kelurahan'
                      : next === 'desa_adat'
                        ? 'desa_adat'
                        : 'desa',
                })
              }
              disabled={!access.enabled}
              options={[
                { value: 'desa', label: 'Desa' },
                { value: 'kelurahan', label: 'Kelurahan' },
                { value: 'desa_adat', label: 'Desa adat' },
              ]}
            />
          </div>
        )
      }}
    />
  )
}
