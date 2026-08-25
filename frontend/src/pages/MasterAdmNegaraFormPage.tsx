/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:21:51
 */

import { admNegaraService } from '../api/services'
import type { AdmNegara, AdmNegaraInput } from '../api/types'
import { SimpleMasterKodeFormPage } from '../components/SimpleMasterKodeFormPage'

const emptyForm: AdmNegaraInput = {
  kode: '',
  nama: '',
  iso3: '',
  is_active: true,
}

function toForm(item: AdmNegara): AdmNegaraInput {
  return {
    kode: item.kode,
    nama: item.nama,
    iso3: item.iso3 || '',
    is_active: item.is_active,
  }
}

function toPayload(form: AdmNegaraInput): AdmNegaraInput {
  return {
    ...form,
    iso3: form.iso3 || null,
  }
}

export function MasterAdmNegaraFormPage() {
  return (
    <SimpleMasterKodeFormPage
      entityLabel="negara"
      description="Kelola data wilayah administrasi negara."
      listPath="/master/adm/negara"
      emptyForm={emptyForm}
      get={admNegaraService.get}
      create={admNegaraService.create}
      update={admNegaraService.update}
      toForm={toForm}
      toPayload={toPayload}
      showDeskripsi={false}
      renderExtraFields={(form, setForm) => (
        <div className="field">
          <label htmlFor="iso3">Kode ISO3</label>
          <input
            id="iso3"
            value={form.iso3 || ''}
            onChange={(event) =>
              setForm({ ...form, iso3: event.target.value.toUpperCase() })
            }
            maxLength={3}
          />
        </div>
      )}
    />
  )
}
