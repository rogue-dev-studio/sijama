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
  wilayah_fung_desa_id: 0,
  kode: '',
  nama: '',
  singkatan: null,
  deskripsi: '',
  is_active: true,
}

function toForm(item: Kelompok): KelompokInput {
  return {
    wilayah_fung_desa_id: item.wilayah_fung_desa_id,
    kode: item.kode,
    nama: item.nama,
    singkatan: item.singkatan,
    deskripsi: item.deskripsi || '',
    is_active: item.is_active,
  }
}

const parentSelect = {
  field: 'wilayah_fung_desa_id' as const,
  label: 'Desa',
  emptyMessage: 'Tambahkan desa terlebih dahulu.',
  loadOptions: async () => {
    const result = await masterDesaService.list({ per_page: 500 })
    return result.items.map((item) => ({
      id: item.id,
      nama: item.wilayah_fung_daerah ? `${item.nama} · ${item.wilayah_fung_daerah.nama}` : item.nama,
    }))
  },
}

export function MasterKelompokFormPage() {
  return (
    <SimpleMasterKodeFormPage
      entityLabel="kelompok"
      description="Kelola kelompok jamaah per desa."
      listPath="/master/wilayah-fung/kelompok"
      emptyForm={emptyForm}
      get={masterKelompokService.get}
      create={masterKelompokService.create}
      update={masterKelompokService.update}
      toForm={toForm}
      parentSelect={parentSelect}
      permissionPrefix="wilayah_fung_kelompok"
      renderExtraFields={(form, setForm, _isEdit, fieldAccess) => {
        const access = fieldAccess('singkatan')
        if (!access.visible) return null
        return (
          <div className="field">
            <label htmlFor="singkatan">Singkatan</label>
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
              placeholder="PJT"
              disabled={!access.enabled}
            />
          </div>
        )
      }}
    />
  )
}
