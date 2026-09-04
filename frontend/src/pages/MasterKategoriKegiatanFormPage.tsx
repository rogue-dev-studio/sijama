/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 16:57:14
 */

import { masterKategoriKegiatanService } from '../api/services'
import type { KategoriKegiatan, KategoriKegiatanInput } from '../api/types'
import { SimpleMasterNamaFormPage } from '../components/SimpleMasterNamaFormPage'

const emptyForm: KategoriKegiatanInput = {
  nama: '',
  deskripsi: '',
  calendar_color: '#2563eb',
  is_active: true,
}

function toForm(item: KategoriKegiatan): KategoriKegiatanInput {
  return {
    nama: item.nama,
    deskripsi: item.deskripsi || '',
    calendar_color: item.calendar_color || '#2563eb',
    is_active: item.is_active,
  }
}

function toPayload(form: KategoriKegiatanInput): KategoriKegiatanInput {
  return {
    ...form,
    deskripsi: form.deskripsi || null,
    calendar_color: form.calendar_color || '#2563eb',
  }
}

export function MasterKategoriKegiatanFormPage() {
  return (
    <SimpleMasterNamaFormPage
      entityLabel="kategori kegiatan"
      description="Kelola kategori kegiatan dan warna tampilan di kalender."
      listPath="/master/kategori-kegiatan"
      emptyForm={emptyForm}
      get={masterKategoriKegiatanService.get}
      create={masterKategoriKegiatanService.create}
      update={masterKategoriKegiatanService.update}
      toForm={toForm}
      toPayload={toPayload}
      permissionPrefix="kategori_kegiatan"
      renderExtraFields={(form, setForm, fieldAccess) => {
        const access = fieldAccess('calendar_color')
        if (!access.visible) return null
        return (
          <div className="field">
            <label htmlFor="calendar_color">Warna kalender</label>
            <div className="field-color">
              <input
                id="calendar_color"
                type="color"
                value={form.calendar_color || '#2563eb'}
                onChange={(event) => setForm({ ...form, calendar_color: event.target.value })}
                disabled={!access.enabled}
              />
              <input
                type="text"
                value={form.calendar_color || '#2563eb'}
                onChange={(event) => setForm({ ...form, calendar_color: event.target.value })}
                pattern="^#[0-9A-Fa-f]{6}$"
                aria-label="Kode hex warna kalender"
                disabled={!access.enabled}
              />
            </div>
          </div>
        )
      }}
    />
  )
}
