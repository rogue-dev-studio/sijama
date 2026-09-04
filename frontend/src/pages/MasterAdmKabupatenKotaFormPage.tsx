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
  wilayah_adm_provinsi_id: 0,
  kode: '',
  nama: '',
  jenis: 'kabupaten',
  singkatan: null,
  singkatan_kawasan_metropolitan: null,
  is_active: true,
}

function toForm(item: AdmKabupatenKota): AdmKabupatenKotaInput {
  return {
    wilayah_adm_provinsi_id: item.wilayah_adm_provinsi_id,
    kode: item.kode,
    nama: item.nama,
    jenis: item.jenis,
    singkatan: item.singkatan,
    singkatan_kawasan_metropolitan: item.singkatan_kawasan_metropolitan,
    is_active: item.is_active,
  }
}

const parentSelect = {
  field: 'wilayah_adm_provinsi_id' as const,
  label: 'Provinsi',
  emptyMessage: 'Tambahkan provinsi terlebih dahulu.',
  loadOptions: async () => {
    const result = await admProvinsiService.list({ per_page: 500 })
    return result.items.map((item) => ({
      id: item.id,
      nama: item.wilayah_adm_negara ? `${item.nama} · ${item.wilayah_adm_negara.nama}` : item.nama,
    }))
  },
}

export function MasterAdmKabupatenKotaFormPage() {
  return (
    <SimpleMasterKodeFormPage
      entityLabel="kabupaten/kota"
      description="Kelola kabupaten dan kota per provinsi."
      listPath="/master/wilayah-adm/kabupaten-kota"
      emptyForm={emptyForm}
      get={admKabupatenKotaService.get}
      create={admKabupatenKotaService.create}
      update={admKabupatenKotaService.update}
      toForm={toForm}
      showDeskripsi={false}
      parentSelect={parentSelect}
      permissionPrefix="wilayah_adm_kabupaten_kota"
      renderExtraFields={(form, setForm, _isEdit, fieldAccess) => {
        const singkatanAccess = fieldAccess('singkatan')
        const metroAccess = fieldAccess('singkatan_kawasan_metropolitan')
        const jenisAccess = fieldAccess('jenis')
        return (
          <>
            {singkatanAccess.visible && (
              <div className="field">
                <label htmlFor="singkatan">Singkatan SNI (3 huruf)</label>
                <input
                  id="singkatan"
                  maxLength={3}
                  value={form.singkatan || ''}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      singkatan: event.target.value.toUpperCase() || null,
                    })
                  }
                  placeholder="BDG"
                  disabled={!singkatanAccess.enabled}
                />
              </div>
            )}
            {metroAccess.visible && (
              <div className="field">
                <label htmlFor="singkatan_kawasan_metropolitan">Kawasan metropolitan</label>
                <input
                  id="singkatan_kawasan_metropolitan"
                  value={form.singkatan_kawasan_metropolitan || ''}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      singkatan_kawasan_metropolitan: event.target.value || null,
                    })
                  }
                  placeholder="Jabodetabek"
                  disabled={!metroAccess.enabled}
                />
              </div>
            )}
            {jenisAccess.visible && (
              <div className="field">
                <label htmlFor="jenis">Jenis</label>
                <SearchableSelect
                  id="jenis"
                  value={form.jenis}
                  onChange={(next) =>
                    setForm({ ...form, jenis: next === 'kota' ? 'kota' : 'kabupaten' })
                  }
                  disabled={!jenisAccess.enabled}
                  options={[
                    { value: 'kabupaten', label: 'Kabupaten' },
                    { value: 'kota', label: 'Kota' },
                  ]}
                />
              </div>
            )}
          </>
        )
      }}
    />
  )
}
