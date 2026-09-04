/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:30:00
 */

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import {
  admDesaKelurahanService,
  admKabupatenKotaService,
  admKecamatanService,
  admNegaraService,
  admProvinsiService,
  jamaahService,
  keluargaService,
  lookupOptionsService,
} from '../api/services'
import type {
  AdmDesaKelurahan,
  AdmKabupatenKota,
  AdmKecamatan,
  AdmNegara,
  AdmProvinsi,
  Jamaah,
  Kelompok,
  KeluargaInput,
  KeluargaJamaahOption,
  LookupOption,
} from '../api/types'
import { fetchWilayahChainFromDesa } from '../lib/admWilayahChain'
import { LOOKUP_TYPE } from '../lib/lookupTypes'
import { SearchableSelect } from '../components/SearchableSelect'
import { useToast } from '../components/ToastProvider'
import { FormPageLoading } from '../components/FormPageLoading'
import { KeluargaAddressFields } from './keluarga/KeluargaAddressFields'
import {
  KeluargaAnggotaSection,
  newAnggotaRow,
  type AnggotaRow,
} from './keluarga/KeluargaAnggotaSection'

const emptyForm: KeluargaInput = {
  wilayah_fung_kelompok_id: null,
  kepala_jamaah_id: 0,
  no_kk: '',
  alamat: '',
  rt: '',
  rw: '',
  wilayah_adm_desa_id: null,
  kode_pos: '',
  catatan: '',
  status: 'aktif',
  anggota: [],
}

export function KeluargaFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notifySaved } = useToast()
  const [form, setForm] = useState<KeluargaInput>(emptyForm)
  const [anggotaRows, setAnggotaRows] = useState<AnggotaRow[]>([])
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([])
  const [jamaahList, setJamaahList] = useState<KeluargaJamaahOption[]>([])
  const [jamaahOptionsLoading, setJamaahOptionsLoading] = useState(false)
  const [hubunganOptions, setHubunganOptions] = useState<LookupOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copyingAddress, setCopyingAddress] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [negaraList, setNegaraList] = useState<AdmNegara[]>([])
  const [provinsiList, setProvinsiList] = useState<AdmProvinsi[]>([])
  const [kabupatenKotaList, setKabupatenKotaList] = useState<AdmKabupatenKota[]>([])
  const [kecamatanList, setKecamatanList] = useState<AdmKecamatan[]>([])
  const [desaKelurahanList, setDesaKelurahanList] = useState<AdmDesaKelurahan[]>([])
  const [selectedNegaraId, setSelectedNegaraId] = useState(0)
  const [selectedProvinsiId, setSelectedProvinsiId] = useState(0)
  const [selectedKabupatenKotaId, setSelectedKabupatenKotaId] = useState(0)
  const [selectedKecamatanId, setSelectedKecamatanId] = useState(0)

  const selectedKepala = jamaahList.find((item) => item.id === form.kepala_jamaah_id) || null

  const applyWilayahChain = useCallback((chain: Awaited<ReturnType<typeof fetchWilayahChainFromDesa>>) => {
    if (!chain) return
    setNegaraList(chain.negaraList)
    setProvinsiList(chain.provinsiList)
    setKabupatenKotaList(chain.kabupatenKotaList)
    setKecamatanList(chain.kecamatanList)
    setDesaKelurahanList(chain.desaKelurahanList)
    setSelectedNegaraId(chain.selectedNegaraId)
    setSelectedProvinsiId(chain.selectedProvinsiId)
    setSelectedKabupatenKotaId(chain.selectedKabupatenKotaId)
    setSelectedKecamatanId(chain.selectedKecamatanId)
  }, [])

  const hydrateWilayahFromDesa = useCallback(
    async (desaId: number | null) => {
      if (!desaId) return
      const chain = await fetchWilayahChainFromDesa(desaId)
      applyWilayahChain(chain)
    },
    [applyWilayahChain],
  )

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [kelompokOptions, lookups, negaraResult] = await Promise.all([
          jamaahService.kelompokOptions(),
          lookupOptionsService.byTypes([LOOKUP_TYPE.HUBUNGAN_KELUARGA]),
          admNegaraService.list({ per_page: 200 }),
        ])
        if (!active) return
        setKelompokList(kelompokOptions)
        setHubunganOptions(lookups[LOOKUP_TYPE.HUBUNGAN_KELUARGA] ?? [])
        setNegaraList(negaraResult.items)

        if (id) {
          const keluarga = await keluargaService.get(Number(id))
          if (!active) return
          setForm({
            wilayah_fung_kelompok_id: keluarga.wilayah_fung_kelompok_id,
            kepala_jamaah_id: keluarga.kepala_jamaah_id || 0,
            no_kk: keluarga.no_kk || '',
            alamat: keluarga.alamat || '',
            rt: keluarga.rt || '',
            rw: keluarga.rw || '',
            wilayah_adm_desa_id: keluarga.wilayah_adm_desa_id,
            kode_pos: keluarga.kode_pos || '',
            catatan: keluarga.catatan || '',
            status: keluarga.status,
            anggota: [],
          })
          setAnggotaRows(
            (keluarga.anggota || [])
              .filter((item) => !item.is_kepala_keluarga)
              .map((item) => ({
                key: String(item.jamaah_id),
                jamaah_id: item.jamaah_id,
                hubungan_keluarga: item.hubungan_keluarga,
                is_kepala_keluarga: false,
                catatan: item.catatan || null,
              })),
          )
          if (keluarga.wilayah_adm_desa_id) {
            await hydrateWilayahFromDesa(keluarga.wilayah_adm_desa_id)
          }
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat data keluarga')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [hydrateWilayahFromDesa, id])

  useEffect(() => {
    if (!form.wilayah_fung_kelompok_id) {
      setJamaahList([])
      return
    }

    let active = true
    setJamaahOptionsLoading(true)

    void keluargaService
      .jamaahOptions({
        wilayah_fung_kelompok_id: form.wilayah_fung_kelompok_id,
        except_keluarga_id: id ? Number(id) : undefined,
      })
      .then((options) => {
        if (!active) return
        setJamaahList(options)
        const validIds = new Set(options.map((item) => item.id))
        setForm((prev) => ({
          ...prev,
          kepala_jamaah_id:
            prev.kepala_jamaah_id && validIds.has(prev.kepala_jamaah_id) ? prev.kepala_jamaah_id : 0,
        }))
        setAnggotaRows((rows) =>
          rows.filter((row) => !row.jamaah_id || validIds.has(row.jamaah_id)),
        )
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat daftar jamaah')
        }
      })
      .finally(() => {
        if (active) setJamaahOptionsLoading(false)
      })

    return () => {
      active = false
    }
  }, [form.wilayah_fung_kelompok_id, id])

  function updateField<K extends keyof KeluargaInput>(key: K, value: KeluargaInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function loadProvinsi(negaraId: number) {
    setSelectedNegaraId(negaraId)
    setSelectedProvinsiId(0)
    setSelectedKabupatenKotaId(0)
    setSelectedKecamatanId(0)
    setProvinsiList([])
    setKabupatenKotaList([])
    setKecamatanList([])
    setDesaKelurahanList([])
    updateField('wilayah_adm_desa_id', null)
    updateField('kode_pos', '')
    if (!negaraId) return
    const result = await admProvinsiService.list({ wilayah_adm_negara_id: negaraId, per_page: 200 })
    setProvinsiList(result.items)
  }

  async function loadKabupaten(provinsiId: number) {
    setSelectedProvinsiId(provinsiId)
    setSelectedKabupatenKotaId(0)
    setSelectedKecamatanId(0)
    setKabupatenKotaList([])
    setKecamatanList([])
    setDesaKelurahanList([])
    updateField('wilayah_adm_desa_id', null)
    updateField('kode_pos', '')
    if (!provinsiId) return
    const result = await admKabupatenKotaService.list({ wilayah_adm_provinsi_id: provinsiId, per_page: 300 })
    setKabupatenKotaList(result.items)
  }

  async function loadKecamatan(kabupatenId: number) {
    setSelectedKabupatenKotaId(kabupatenId)
    setSelectedKecamatanId(0)
    setKecamatanList([])
    setDesaKelurahanList([])
    updateField('wilayah_adm_desa_id', null)
    updateField('kode_pos', '')
    if (!kabupatenId) return
    const result = await admKecamatanService.list({ wilayah_adm_kabupaten_kota_id: kabupatenId, per_page: 400 })
    setKecamatanList(result.items)
  }

  async function loadDesa(kecamatanId: number) {
    setSelectedKecamatanId(kecamatanId)
    setDesaKelurahanList([])
    updateField('wilayah_adm_desa_id', null)
    updateField('kode_pos', '')
    if (!kecamatanId) return
    const result = await admDesaKelurahanService.list({ wilayah_adm_kecamatan_id: kecamatanId, per_page: 500 })
    setDesaKelurahanList(result.items)
  }

  async function copyAddressFromKepala() {
    if (!selectedKepala) return
    setCopyingAddress(true)
    setError(null)
    try {
      let source: KeluargaJamaahOption | Jamaah = selectedKepala
      if (!source.wilayah_adm_desa_id && source.id) {
        source = await jamaahService.get(source.id)
      }

      setForm((prev) => ({
        ...prev,
        alamat: source.alamat || '',
        rt: source.rt || '',
        rw: source.rw || '',
        wilayah_adm_desa_id: source.wilayah_adm_desa_id,
        kode_pos: source.kode_pos || '',
      }))

      if (source.wilayah_adm_desa_id) {
        await hydrateWilayahFromDesa(source.wilayah_adm_desa_id)
      } else {
        setSelectedNegaraId(0)
        setSelectedProvinsiId(0)
        setSelectedKabupatenKotaId(0)
        setSelectedKecamatanId(0)
        setProvinsiList([])
        setKabupatenKotaList([])
        setKecamatanList([])
        setDesaKelurahanList([])
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyalin alamat kepala keluarga')
    } finally {
      setCopyingAddress(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.kepala_jamaah_id) {
      setError('Pilih kepala keluarga.')
      return
    }
    if (!form.wilayah_fung_kelompok_id) {
      setError('Pilih kelompok.')
      return
    }

    const anggota = anggotaRows
      .filter((row) => row.jamaah_id && row.jamaah_id !== form.kepala_jamaah_id)
      .map((row) => ({
        jamaah_id: row.jamaah_id,
        hubungan_keluarga: row.hubungan_keluarga,
        is_kepala_keluarga: false,
        catatan: row.catatan || null,
      }))

    const payload: KeluargaInput = {
      ...form,
      no_kk: form.no_kk?.trim() || null,
      alamat: form.alamat?.trim() || null,
      rt: form.rt?.trim() || null,
      rw: form.rw?.trim() || null,
      kode_pos: form.kode_pos?.trim() || null,
      catatan: form.catatan?.trim() || null,
      anggota,
    }

    setSubmitting(true)
    setError(null)
    try {
      if (isEdit && id) {
        await keluargaService.update(Number(id), payload)
      } else {
        await keluargaService.create(payload)
      }
      notifySaved('keluarga', isEdit ? 'update' : 'create')
      navigate('/keluarga')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan keluarga')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <FormPageLoading
        title={isEdit ? 'Edit keluarga' : 'Tambah keluarga'}
        description="Atur kepala keluarga, nomor KK, alamat rumah tangga, dan anggota keluarga."
        message="Memuat data keluarga…"
      />
    )
  }

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit keluarga' : 'Tambah keluarga'}</h1>
        <p>Atur kepala keluarga, nomor KK, alamat rumah tangga, dan anggota keluarga.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <fieldset>
          <legend className="form-section-title form-section-title--first">Data keluarga</legend>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label htmlFor="wilayah_fung_kelompok_id">Kelompok</label>
              <SearchableSelect
                id="wilayah_fung_kelompok_id"
                value={form.wilayah_fung_kelompok_id ? String(form.wilayah_fung_kelompok_id) : ''}
                onChange={(next) => {
                  const kelompokId = Number(next) || null
                  setForm({
                    ...form,
                    wilayah_fung_kelompok_id: kelompokId,
                    kepala_jamaah_id: 0,
                  })
                  setAnggotaRows([])
                }}
                placeholder="Pilih kelompok"
                required
                options={[
                  { value: '', label: 'Pilih kelompok' },
                  ...kelompokList.map((item) => ({ value: String(item.id), label: item.nama })),
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="kepala_jamaah_id">Kepala keluarga</label>
              <SearchableSelect
                id="kepala_jamaah_id"
                value={form.kepala_jamaah_id ? String(form.kepala_jamaah_id) : ''}
                onChange={(next) => updateField('kepala_jamaah_id', Number(next) || 0)}
                placeholder="Pilih jamaah"
                required
                disabled={!form.wilayah_fung_kelompok_id || jamaahOptionsLoading}
                options={[
                  { value: '', label: jamaahOptionsLoading ? 'Memuat jamaah…' : 'Pilih jamaah' },
                  ...jamaahList.map((item) => ({
                    value: String(item.id),
                    label: item.nama + (item.nik ? ` · ${item.nik}` : ''),
                  })),
                ]}
              />
              {form.wilayah_fung_kelompok_id && !jamaahOptionsLoading && jamaahList.length === 0 && (
                <p className="field-hint field-hint--error">
                  Tidak ada jamaah tersedia. Semua jamaah aktif di kelompok ini sudah terdaftar di keluarga
                  lain.
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="no_kk">No. KK</label>
              <input
                id="no_kk"
                value={form.no_kk || ''}
                onChange={(event) => updateField('no_kk', event.target.value)}
                maxLength={16}
                placeholder="Nomor kartu keluarga"
              />
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={form.status || 'aktif'}
                onChange={(event) =>
                  updateField('status', event.target.value as 'aktif' | 'nonaktif')
                }
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
            <div className="field field--full">
              <label htmlFor="catatan">Catatan keluarga</label>
              <textarea
                id="catatan"
                rows={2}
                value={form.catatan || ''}
                onChange={(event) => updateField('catatan', event.target.value)}
                placeholder="Keterangan administrasi keluarga (opsional)"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <div className="form-section-head">
            <div>
              <h2 className="form-section-title">Alamat rumah tangga</h2>
              <p className="field-hint">
                Lengkapi alamat jalan, RT/RW, dan wilayah administrasi resmi (negara hingga desa/kelurahan).
              </p>
            </div>
            <button
              type="button"
              className="btn btn--secondary btn--small"
              disabled={!selectedKepala || copyingAddress}
              onClick={() => void copyAddressFromKepala()}
            >
              {copyingAddress ? 'Menyalin…' : 'Salin dari kepala keluarga'}
            </button>
          </div>
          <KeluargaAddressFields
            form={form}
            negaraList={negaraList}
            provinsiList={provinsiList}
            kabupatenKotaList={kabupatenKotaList}
            kecamatanList={kecamatanList}
            desaKelurahanList={desaKelurahanList}
            selectedNegaraId={selectedNegaraId}
            selectedProvinsiId={selectedProvinsiId}
            selectedKabupatenKotaId={selectedKabupatenKotaId}
            selectedKecamatanId={selectedKecamatanId}
            onFieldChange={updateField}
            onNegaraChange={(negaraId) => void loadProvinsi(negaraId)}
            onProvinsiChange={(provinsiId) => void loadKabupaten(provinsiId)}
            onKabupatenKotaChange={(kabupatenId) => void loadKecamatan(kabupatenId)}
            onKecamatanChange={(kecamatanId) => void loadDesa(kecamatanId)}
          />
        </fieldset>

        <fieldset>
          <legend className="form-section-title">Anggota keluarga</legend>
          <p className="field-hint">
            Kepala keluarga otomatis terdaftar. Tambahkan istri, anak, atau anggota lain di bawah ini.
          </p>
          {selectedKepala && (
            <div className="keluarga-kepala-preview">
              <span className="badge badge--ok">Kepala</span>
              <strong>{selectedKepala.nama}</strong>
              {selectedKepala.nik ? <span className="keluarga-kepala-preview__meta">NIK {selectedKepala.nik}</span> : null}
            </div>
          )}
          <KeluargaAnggotaSection
            rows={anggotaRows}
            kepalaJamaahId={form.kepala_jamaah_id}
            jamaahOptions={jamaahList}
            hubunganOptions={hubunganOptions}
            onAdd={() => setAnggotaRows((rows) => [...rows, newAnggotaRow()])}
            onUpdate={(key, patch) =>
              setAnggotaRows((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)))
            }
            onRemove={(key) => setAnggotaRows((rows) => rows.filter((row) => row.key !== key))}
          />
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Simpan keluarga'}
          </button>
          <Link to="/keluarga" className="btn btn--secondary">
            Batal
          </Link>
        </div>
      </form>
    </>
  )
}
