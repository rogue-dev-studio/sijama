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
  if (!desa.wilayah_adm_kecamatan_id) return null

  const kecamatan = await admKecamatanService.get(desa.wilayah_adm_kecamatan_id)
  if (!kecamatan.wilayah_adm_kabupaten_kota_id) return null

  const kabupaten = await admKabupatenKotaService.get(kecamatan.wilayah_adm_kabupaten_kota_id)
  if (!kabupaten.wilayah_adm_provinsi_id) return null

  const provinsi = await admProvinsiService.get(kabupaten.wilayah_adm_provinsi_id)
  if (!provinsi.wilayah_adm_negara_id) return null

  const negara = await admNegaraService.get(provinsi.wilayah_adm_negara_id)
  const desaResult = await admDesaKelurahanService.list({
    wilayah_adm_kecamatan_id: kecamatan.id,
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
