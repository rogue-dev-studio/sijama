/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:41:12
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:25:00
 */

import { useEffect, useMemo, useState } from 'react'
import {
  admDesaKelurahanService,
  admKabupatenKotaService,
  admKecamatanService,
  admKodePosService,
  admNegaraService,
  admProvinsiService,
} from '../api/services'
import type {
  AdmDesaKelurahan,
  AdmKabupatenKota,
  AdmKecamatan,
  AdmKodePos,
  AdmNegara,
  AdmProvinsi,
  Paginated,
} from '../api/types'
import { SearchableSelect } from '../components/SearchableSelect'
import {
  SimpleMasterListPage,
  type GatedColumn,
  type MasterListParams,
} from '../components/SimpleMasterListPage'

type KodePosRow = AdmKodePos & { nama: string }

function formatWilayah(item: AdmKodePos): string {
  const w = item.wilayah
  if (!w) {
    return item.wilayah_adm_desa?.nama || '—'
  }

  return [w.wilayah_adm_desa, w.wilayah_adm_kecamatan, w.wilayah_adm_kabupaten_kota, w.wilayah_adm_provinsi].filter(Boolean).join(', ')
}

const columns: GatedColumn<KodePosRow>[] = [
  {
    key: 'kode',
    label: 'Kode pos',
    cell: (item) => item.kode,
    exportValue: (item) => item.kode,
  },
  {
    key: 'wilayah',
    label: 'Wilayah',
    sortable: false,
    cell: (item) => formatWilayah(item),
    exportValue: (item) => formatWilayah(item),
  },
  {
    key: 'wilayah_adm_negara',
    label: 'Negara',
    sortable: false,
    cell: (item) => item.wilayah?.wilayah_adm_negara || '—',
    exportValue: (item) => item.wilayah?.wilayah_adm_negara || '',
  },
  {
    key: 'is_active',
    label: 'Status',
    cell: (item) => (
      <span className={`badge ${item.is_active !== false ? 'badge--ok' : 'badge--muted'}`}>
        {item.is_active !== false ? 'Aktif' : 'Nonaktif'}
      </span>
    ),
    exportValue: (item) => (item.is_active !== false ? 'Aktif' : 'Nonaktif'),
  },
]

export function MasterAdmKodePosPage() {
  const [negaraList, setNegaraList] = useState<AdmNegara[]>([])
  const [provinsiList, setProvinsiList] = useState<AdmProvinsi[]>([])
  const [kabupatenKotaList, setKabupatenKotaList] = useState<AdmKabupatenKota[]>([])
  const [kecamatanList, setKecamatanList] = useState<AdmKecamatan[]>([])
  const [desaKelurahanList, setDesaKelurahanList] = useState<AdmDesaKelurahan[]>([])
  const [negaraId, setNegaraId] = useState(0)
  const [provinsiId, setProvinsiId] = useState(0)
  const [kabupatenKotaId, setKabupatenKotaId] = useState(0)
  const [kecamatanId, setKecamatanId] = useState(0)
  const [desaKelurahanId, setDesaKelurahanId] = useState(0)

  useEffect(() => {
    let active = true
    void admNegaraService.list({ per_page: 100 }).then((result) => {
      if (active) setNegaraList(result.items)
    })
    return () => {
      active = false
    }
  }, [])

  const extraFilterParams = useMemo(
    () => ({
      wilayah_adm_negara_id: negaraId || undefined,
      wilayah_adm_provinsi_id: provinsiId || undefined,
      wilayah_adm_kabupaten_kota_id: kabupatenKotaId || undefined,
      wilayah_adm_kecamatan_id: kecamatanId || undefined,
      wilayah_adm_desa_id: desaKelurahanId || undefined,
    }),
    [negaraId, provinsiId, kabupatenKotaId, kecamatanId, desaKelurahanId],
  )

  const hasExtraFilters =
    negaraId > 0 ||
    provinsiId > 0 ||
    kabupatenKotaId > 0 ||
    kecamatanId > 0 ||
    desaKelurahanId > 0

  async function listKodePos(params: MasterListParams): Promise<Paginated<KodePosRow>> {
    const result = await admKodePosService.list({
      q: typeof params.q === 'string' ? params.q : undefined,
      wilayah_adm_negara_id: typeof params.wilayah_adm_negara_id === 'number' ? params.wilayah_adm_negara_id : undefined,
      wilayah_adm_provinsi_id: typeof params.wilayah_adm_provinsi_id === 'number' ? params.wilayah_adm_provinsi_id : undefined,
      wilayah_adm_kabupaten_kota_id:
        typeof params.wilayah_adm_kabupaten_kota_id === 'number' ? params.wilayah_adm_kabupaten_kota_id : undefined,
      wilayah_adm_kecamatan_id: typeof params.wilayah_adm_kecamatan_id === 'number' ? params.wilayah_adm_kecamatan_id : undefined,
      wilayah_adm_desa_id:
        typeof params.wilayah_adm_desa_id === 'number' ? params.wilayah_adm_desa_id : undefined,
      page: typeof params.page === 'number' ? params.page : undefined,
      per_page: typeof params.per_page === 'number' ? params.per_page : undefined,
      sort_by: typeof params.sort_by === 'string' ? params.sort_by : undefined,
      sort_dir: params.sort_dir === 'asc' || params.sort_dir === 'desc' ? params.sort_dir : undefined,
    })

    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        nama: item.kode,
      })),
    }
  }

  async function handleNegaraChange(nextId: number, setPage: (page: number) => void) {
    setNegaraId(nextId)
    setProvinsiId(0)
    setKabupatenKotaId(0)
    setKecamatanId(0)
    setDesaKelurahanId(0)
    setKabupatenKotaList([])
    setKecamatanList([])
    setDesaKelurahanList([])
    setProvinsiList(
      nextId > 0
        ? (await admProvinsiService.list({ wilayah_adm_negara_id: nextId, per_page: 100 })).items
        : [],
    )
    setPage(1)
  }

  async function handleProvinsiChange(nextId: number, setPage: (page: number) => void) {
    setProvinsiId(nextId)
    setKabupatenKotaId(0)
    setKecamatanId(0)
    setDesaKelurahanId(0)
    setKecamatanList([])
    setDesaKelurahanList([])
    setKabupatenKotaList(
      nextId > 0
        ? (await admKabupatenKotaService.list({ wilayah_adm_provinsi_id: nextId, per_page: 100 })).items
        : [],
    )
    setPage(1)
  }

  async function handleKabupatenKotaChange(nextId: number, setPage: (page: number) => void) {
    setKabupatenKotaId(nextId)
    setKecamatanId(0)
    setDesaKelurahanId(0)
    setDesaKelurahanList([])
    setKecamatanList(
      nextId > 0
        ? (await admKecamatanService.list({ wilayah_adm_kabupaten_kota_id: nextId, per_page: 100 })).items
        : [],
    )
    setPage(1)
  }

  async function handleKecamatanChange(nextId: number, setPage: (page: number) => void) {
    setKecamatanId(nextId)
    setDesaKelurahanId(0)
    setDesaKelurahanList(
      nextId > 0
        ? (await admDesaKelurahanService.list({ wilayah_adm_kecamatan_id: nextId, per_page: 100 })).items
        : [],
    )
    setPage(1)
  }

  function clearWilayahFilters() {
    setNegaraId(0)
    setProvinsiId(0)
    setKabupatenKotaId(0)
    setKecamatanId(0)
    setDesaKelurahanId(0)
    setProvinsiList([])
    setKabupatenKotaList([])
    setKecamatanList([])
    setDesaKelurahanList([])
  }

  return (
    <SimpleMasterListPage<KodePosRow>
      title="Master Kode Pos"
      description="Kelola kode pos per desa/kelurahan (wilayah administrasi resmi)."
      entityLabel="kode pos"
      basePath="/master/wilayah-adm/kode-pos"
      permissionPrefix="wilayah_adm_kode_pos"
      createLabel="Tambah kode pos"
      searchPlaceholder="Cari kode pos atau nama wilayah…"
      showStatusFilter={false}
      list={listKodePos}
      remove={admKodePosService.remove}
      columns={columns}
      itemLabel={(item) => item.kode}
      extraFilterParams={extraFilterParams}
      hasExtraFilters={hasExtraFilters}
      onClearExtraFilters={clearWilayahFilters}
      renderExtraFilters={({ setPage }) => (
        <>
          <div className="field">
            <label htmlFor="filter_negara">Negara</label>
            <SearchableSelect
              id="filter_negara"
              value={negaraId ? String(negaraId) : ''}
              onChange={(next) => void handleNegaraChange(Number(next) || 0, setPage)}
              placeholder="Semua negara"
              options={[
                { value: '', label: 'Semua negara' },
                ...negaraList.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="filter_provinsi">Provinsi</label>
            <SearchableSelect
              id="filter_provinsi"
              value={provinsiId ? String(provinsiId) : ''}
              onChange={(next) => void handleProvinsiChange(Number(next) || 0, setPage)}
              disabled={negaraId === 0}
              placeholder="Semua provinsi"
              options={[
                { value: '', label: 'Semua provinsi' },
                ...provinsiList.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="filter_kabupaten_kota">Kabupaten/Kota</label>
            <SearchableSelect
              id="filter_kabupaten_kota"
              value={kabupatenKotaId ? String(kabupatenKotaId) : ''}
              onChange={(next) => void handleKabupatenKotaChange(Number(next) || 0, setPage)}
              disabled={provinsiId === 0}
              placeholder="Semua kab/kota"
              options={[
                { value: '', label: 'Semua kab/kota' },
                ...kabupatenKotaList.map((item) => ({
                  value: String(item.id),
                  label: item.nama,
                })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="filter_kecamatan">Kecamatan</label>
            <SearchableSelect
              id="filter_kecamatan"
              value={kecamatanId ? String(kecamatanId) : ''}
              onChange={(next) => void handleKecamatanChange(Number(next) || 0, setPage)}
              disabled={kabupatenKotaId === 0}
              placeholder="Semua kecamatan"
              options={[
                { value: '', label: 'Semua kecamatan' },
                ...kecamatanList.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="filter_wilayah_adm_desa">Desa/Kelurahan</label>
            <SearchableSelect
              id="filter_wilayah_adm_desa"
              value={desaKelurahanId ? String(desaKelurahanId) : ''}
              onChange={(next) => {
                setDesaKelurahanId(Number(next) || 0)
                setPage(1)
              }}
              disabled={kecamatanId === 0}
              placeholder="Semua desa/kelurahan"
              options={[
                { value: '', label: 'Semua desa/kelurahan' },
                ...desaKelurahanList.map((item) => ({
                  value: String(item.id),
                  label: item.nama,
                })),
              ]}
            />
          </div>
        </>
      )}
    />
  )
}
