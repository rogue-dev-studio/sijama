/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:41:12
 */

import { admDesaKelurahanService, admKodePosService } from '../api/services'
import type { AdmKodePos, AdmKodePosInput } from '../api/types'
import { SimpleMasterKodeFormPage } from '../components/SimpleMasterKodeFormPage'

type KodePosForm = {
  kode: string
  nama: string
  desa_kelurahan_id: number
  is_active?: boolean
}

const emptyForm: KodePosForm = {
  kode: '',
  nama: '',
  desa_kelurahan_id: 0,
  is_active: true,
}

function toForm(item: AdmKodePos): KodePosForm {
  return {
    kode: item.kode,
    nama: item.nama_wilayah || '',
    desa_kelurahan_id: item.desa_kelurahan_id || 0,
    is_active: item.is_active,
  }
}

function toPayload(form: KodePosForm): AdmKodePosInput {
  return {
    kode: form.kode,
    nama_wilayah: form.nama || null,
    desa_kelurahan_id: form.desa_kelurahan_id || null,
    is_active: form.is_active,
  }
}

const parentSelect = {
  field: 'desa_kelurahan_id' as const,
  label: 'Desa/Kelurahan',
  emptyMessage: 'Tambahkan desa/kelurahan terlebih dahulu.',
  allowEmptyOptions: true,
  loadOptions: async () => {
    const result = await admDesaKelurahanService.list({ per_page: 10000 })
    return result.items.map((item) => ({
      id: item.id,
      nama: item.kecamatan ? `${item.nama} · ${item.kecamatan.nama}` : item.nama,
    }))
  },
}

export function MasterAdmKodePosFormPage() {
  return (
    <SimpleMasterKodeFormPage
      entityLabel="kode pos"
      description="Kelola kode pos dan tautan ke desa/kelurahan."
      listPath="/master/adm/kode-pos"
      emptyForm={emptyForm}
      get={admKodePosService.get}
      create={(data) => admKodePosService.create(toPayload(data))}
      update={(id, data) =>
        admKodePosService.update(id, toPayload({ ...emptyForm, ...data } as KodePosForm))
      }
      toForm={toForm}
      toPayload={(form) => form}
      showDeskripsi={false}
      parentSelect={parentSelect}
    />
  )
}
