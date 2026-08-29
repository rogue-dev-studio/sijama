/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:30:00
 */

import {
  admDesaKelurahanService,
  admKabupatenKotaService,
  admKecamatanService,
  admNegaraService,
  admProvinsiService,
} from '../api/services'
import type {
  AdmDesaKelurahan,
  AdmKabupatenKota,
  AdmKecamatan,
  AdmNegara,
  AdmProvinsi,
} from '../api/types'

export type WilayahChainLists = {
  negaraList: AdmNegara[]
  provinsiList: AdmProvinsi[]
  kabupatenKotaList: AdmKabupatenKota[]
  kecamatanList: AdmKecamatan[]
  desaKelurahanList: AdmDesaKelurahan[]
  selectedNegaraId: number
  selectedProvinsiId: number
  selectedKabupatenKotaId: number
  selectedKecamatanId: number
}

export async function fetchWilayahChainFromDesa(desaId: number): Promise<WilayahChainLists | null> {
  const desa = await admDesaKelurahanService.get(desaId)
  if (!desa.kecamatan_id) return null

  const kecamatan = await admKecamatanService.get(desa.kecamatan_id)
  if (!kecamatan.kabupaten_kota_id) return null

  const kabupaten = await admKabupatenKotaService.get(kecamatan.kabupaten_kota_id)
  if (!kabupaten.provinsi_id) return null

  const provinsi = await admProvinsiService.get(kabupaten.provinsi_id)
  if (!provinsi.negara_id) return null

  const negara = await admNegaraService.get(provinsi.negara_id)
  const desaResult = await admDesaKelurahanService.list({
    kecamatan_id: kecamatan.id,
    per_page: 500,
  })

  return {
    negaraList: [negara],
    provinsiList: [provinsi],
    kabupatenKotaList: [kabupaten],
    kecamatanList: [kecamatan],
    desaKelurahanList: desaResult.items,
    selectedNegaraId: negara.id,
    selectedProvinsiId: provinsi.id,
    selectedKabupatenKotaId: kabupaten.id,
    selectedKecamatanId: kecamatan.id,
  }
}
