/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */
import { useEffect, useId, useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import { masterMatriksService } from '../api/services'
import type { Dapukan, HakAkses } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { ExportPrintActions } from '../components/ExportPrintActions'
import { SearchableSelect } from '../components/SearchableSelect'
import { useToast } from '../components/ToastProvider'
import { useConfirm } from '../components/ConfirmDialogProvider'
import { listExportAccess } from '../lib/listUiAccess'

const ACTION_COLUMNS: Array<{ key: HakAkses['aksi']; label: string }> = [
  { key: 'view', label: 'LIHAT' },
  { key: 'create', label: 'BUAT' },
  { key: 'update', label: 'UBAH' },
  { key: 'delete', label: 'HAPUS' },
  { key: 'execute', label: 'EKSEKUSI' },
]

type SubFiturBucket = {
  id: number
  slug: string
  nama: string
  urutan: number
  permissions: HakAkses[]
}

type FeatureBucket = {
  id: number
  slug: string
  nama: string
  urutan: number
  subFitur: SubFiturBucket[]
  permissions: HakAkses[]
}

type ModuleBucket = {
  key: string
  label: string
  urutan: number
  fitur: FeatureBucket[]
  permissions: HakAkses[]
}

type DetailRow = { key: string; nama: string; permissions: HakAkses[] }

type MenuLike = NonNullable<NonNullable<HakAkses['fitur']>['menu']>

function rootMenu(menu?: MenuLike | null): MenuLike | null {
  if (!menu) return null
  let current: MenuLike = menu
  while (current.parent) {
    current = current.parent
  }
  return current
}

function moduleKeyFromHak(item: HakAkses): string {
  const root = rootMenu(item.fitur?.menu)
  if (root?.slug) return root.slug
  if (item.fitur?.menu?.slug) return item.fitur.menu.slug
  return item.slug.split('.')[0] || 'lainnya'
}

function moduleLabel(key: string, item?: HakAkses): string {
  const root = rootMenu(item?.fitur?.menu)
  if (root?.nama) return root.nama
  return key
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function moduleUrutan(item?: HakAkses): number {
  return rootMenu(item?.fitur?.menu)?.urutan ?? 999
}

function leafMenuKey(item: HakAkses): string {
  return item.fitur?.menu?.slug || item.fitur?.slug || moduleKeyFromHak(item)
}

function leafMenuLabel(item: HakAkses): string {
  return item.fitur?.menu?.nama || item.fitur?.nama || moduleLabel(moduleKeyFromHak(item), item)
}

function leafMenuUrutan(item: HakAkses): number {
  return item.fitur?.menu?.urutan ?? 999
}

function subFiturUrutan(slug: string, menuSlug: string): number {
  if (slug === menuSlug) return 0
  if (slug.includes('-btn-create')) return 5
  if (slug.includes('-btn-update')) return 6
  if (slug.includes('-btn-delete')) return 7
  if (slug.includes('-btn-enroll_face') || slug.includes('-btn-wajah')) return 8
  if (slug.includes('-btn-print') || slug.includes('-btn-cetak')) return 10
  if (slug.includes('-btn-export-csv') || slug.includes('-btn-export_csv')) return 11
  if (slug.includes('-btn-export-excel') || slug.includes('-btn-export_excel')) return 12
  if (slug.includes('-col-')) return 20
  if (slug.includes('absensi')) return 1
  if (slug.includes('jamaah')) return 2
  if (slug.includes('kategori')) return 3
  return 50
}

function sameIds(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  const left = [...a].sort((x, y) => x - y)
  const right = [...b].sort((x, y) => x - y)
  return left.every((value, index) => value === right[index])
}

function filterEditableIds(ids: number[], editableIds: Set<number>): number[] {
  return ids.filter((id) => editableIds.has(id))
}

function matchesQuery(item: HakAkses, query: string): boolean {
  if (!query) return true
  const hay = [
    item.nama,
    item.slug,
    item.aksi,
    item.fitur?.nama,
    item.fitur?.slug,
    item.fitur?.menu?.nama,
    item.fitur?.menu?.slug,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return hay.includes(query)
}

function buildModules(items: HakAkses[]): ModuleBucket[] {
  const moduleMap = new Map<string, { label: string; urutan: number; items: HakAkses[] }>()
  for (const item of items) {
    const key = moduleKeyFromHak(item)
    const current = moduleMap.get(key)
    if (current) {
      current.items.push(item)
    } else {
      moduleMap.set(key, {
        label: moduleLabel(key, item),
        urutan: moduleUrutan(item),
        items: [item],
      })
    }
  }

  return [...moduleMap.entries()]
    .sort(([, a], [, b]) => a.urutan - b.urutan || a.label.localeCompare(b.label))
    .map(([key, bucket]) => {
      const featureMap = new Map<
        string,
        { id: number; slug: string; nama: string; urutan: number; items: HakAkses[] }
      >()
      for (const item of bucket.items) {
        const menuKey = leafMenuKey(item)
        const current = featureMap.get(menuKey)
        if (current) {
          current.items.push(item)
        } else {
          featureMap.set(menuKey, {
            id: item.fitur?.menu_id || item.fitur?.menu?.id || 0,
            slug: menuKey,
            nama: leafMenuLabel(item),
            urutan: leafMenuUrutan(item),
            items: [item],
          })
        }
      }

      const fitur: FeatureBucket[] = [...featureMap.values()]
        .map((feature) => {
          const subMap = new Map<number, SubFiturBucket>()
          for (const item of feature.items) {
            const fiturId = item.fitur_id || item.fitur?.id || 0
            const existing = subMap.get(fiturId)
            if (existing) {
              existing.permissions.push(item)
            } else {
              const slug = item.fitur?.slug || feature.slug
              subMap.set(fiturId, {
                id: fiturId,
                slug,
                nama: item.fitur?.nama || feature.nama,
                urutan: subFiturUrutan(slug, feature.slug),
                permissions: [item],
              })
            }
          }
          const subFitur = [...subMap.values()]
            .map((row) => ({
              ...row,
              permissions: [...row.permissions].sort((a, b) => a.aksi.localeCompare(b.aksi)),
            }))
            .sort((a, b) => a.urutan - b.urutan || a.nama.localeCompare(b.nama))

          return {
            id: feature.id,
            slug: feature.slug,
            nama: feature.nama,
            urutan: feature.urutan,
            subFitur,
            permissions: feature.items,
          }
        })
        .sort((a, b) => a.urutan - b.urutan || a.nama.localeCompare(b.nama))

      return {
        key,
        label: bucket.label,
        urutan: bucket.urutan,
        fitur,
        permissions: bucket.items,
      }
    })
}

function buildDetailPermissionRows(feature: FeatureBucket): DetailRow[] {
  const hasChildren = feature.subFitur.length > 1
  const parent = feature.subFitur.find((sub) => sub.slug === feature.slug)
  const children = hasChildren
    ? feature.subFitur.filter((sub) => sub.slug !== feature.slug)
    : feature.subFitur

  // Keep create/update/delete/execute from the page-level fitur (e.g. konfig.update).
  // Hide only the redundant page "view" when section sub-fiturs already exist.
  const parentActionRows: DetailRow[] =
    hasChildren && parent
      ? (() => {
          const permissions = parent.permissions.filter((permission) => permission.aksi !== 'view')
          if (permissions.length === 0) return []
          return [
            {
              key: `parent:${parent.id}`,
              nama: parent.nama,
              permissions,
            },
          ]
        })()
      : []

  const childRows: DetailRow[] = children.map((sub) => ({
    key: `sub:${sub.id}`,
    nama: sub.nama,
    permissions: sub.permissions,
  }))

  return [...parentActionRows, ...childRows]
}

function SwitchToggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  label: string
  onChange: (next: boolean) => void
}) {
  return (
    <label className={`matriks-switch${checked ? ' is-on' : ''}${disabled ? ' is-disabled' : ''}`}>
      <span className="matriks-switch__label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className="matriks-switch__control"
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span className="matriks-switch__thumb" />
      </button>
    </label>
  )
}

export function MasterMatriksPage() {
  const { can, user, refresh } = useAuth()
  const { notifySuccess } = useToast()
  const { confirm } = useConfirm()
  const exportAccess = listExportAccess(can, 'matriks')
  const canUpdate = can('matriks.update')
  const tabsId = useId()
  const [dapukanList, setDapukanList] = useState<Dapukan[]>([])
  const [hakAksesList, setHakAksesList] = useState<HakAkses[]>([])
  const [selectedDapukanId, setSelectedDapukanId] = useState<number | ''>('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [baselineIds, setBaselineIds] = useState<number[]>([])
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('')
  const [expandedFitur, setExpandedFitur] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await masterMatriksService.get()
      const editable = new Set(data.hak_akses.map((item) => item.id))
      setDapukanList(data.dapukan)
      setHakAksesList(data.hak_akses)
      if (data.dapukan.length > 0) {
        const first = data.dapukan[0]
        const ids = filterEditableIds(first.hak_akses_ids ?? [], editable)
        setSelectedDapukanId(first.id)
        setSelectedIds(ids)
        setBaselineIds(ids)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat matriks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const editableIdSet = useMemo(
    () => new Set(hakAksesList.map((item) => item.id)),
    [hakAksesList],
  )

  const selectedDapukan = useMemo(
    () => dapukanList.find((item) => item.id === selectedDapukanId),
    [dapukanList, selectedDapukanId],
  )

  const modules = useMemo(() => buildModules(hakAksesList), [hakAksesList])

  useEffect(() => {
    if (modules.length === 0) {
      setActiveTab('')
      return
    }
    if (!modules.some((mod) => mod.key === activeTab)) {
      setActiveTab(modules[0].key)
    }
  }, [modules, activeTab])

  const activeModule = useMemo(
    () => modules.find((mod) => mod.key === activeTab) ?? null,
    [modules, activeTab],
  )

  const visibleFitur = useMemo(() => {
    if (!activeModule) return []
    const q = query.trim().toLowerCase()
    if (!q) return activeModule.fitur
    return activeModule.fitur.filter((feature) =>
      feature.permissions.some((item) => matchesQuery(item, q)) ||
      feature.subFitur.some((sub) =>
        sub.nama.toLowerCase().includes(q) ||
        sub.permissions.some((item) => matchesQuery(item, q)),
      ),
    )
  }, [activeModule, query])

  const dirty = useMemo(
    () => !sameIds(selectedIds, baselineIds),
    [selectedIds, baselineIds],
  )

  async function handleDapukanChange(id: number) {
    if (dirty) {
      const ok = await confirm({
        title: 'Perubahan belum disimpan',
        message: 'Perubahan belum disimpan. Ganti dapukan?',
        tone: 'default',
        confirmLabel: 'Ya, ganti',
      })
      if (!ok) return
    }
    setSelectedDapukanId(id)
    setError(null)
    setQuery('')
    const dapukan = dapukanList.find((item) => item.id === id)
    const ids = filterEditableIds(dapukan?.hak_akses_ids ?? [], editableIdSet)
    setSelectedIds(ids)
    setBaselineIds(ids)
  }

  function setIdsSelection(ids: number[], checked: boolean) {
    if (!canUpdate) return
    setSelectedIds((prev) => {
      if (checked) return [...new Set([...prev, ...ids])]
      const remove = new Set(ids)
      return prev.filter((id) => !remove.has(id))
    })
    setError(null)
  }

  function toggleDetailPermission(row: DetailRow, permission: HakAkses) {
    if (!canUpdate) return
    setSelectedIds((prev) => {
      const isOn = prev.includes(permission.id)
      const viewPerm = row.permissions.find((item) => item.aksi === 'view')

      if (isOn) {
        if (permission.aksi === 'view') {
          const removeIds = new Set(row.permissions.map((item) => item.id))
          return prev.filter((id) => !removeIds.has(id))
        }
        return prev.filter((id) => id !== permission.id)
      }

      if (permission.aksi === 'view') {
        return [...new Set([...prev, permission.id])]
      }

      const toAdd = [permission.id]
      if (viewPerm) toAdd.push(viewPerm.id)
      return [...new Set([...prev, ...toAdd])]
    })
    setError(null)
  }

  function resetChanges() {
    setSelectedIds(baselineIds)
    setError(null)
  }

  async function handleSave() {
    if (!selectedDapukanId) return
    setSaving(true)
    setError(null)
    try {
      const updated = await masterMatriksService.update(selectedDapukanId, selectedIds)
      const nextIds = filterEditableIds(updated.hak_akses_ids ?? selectedIds, editableIdSet)
      setDapukanList((prev) =>
        prev.map((item) =>
          item.id === updated.id
            ? { ...item, hak_akses_ids: updated.hak_akses_ids ?? nextIds }
            : item,
        ),
      )
      setSelectedIds(nextIds)
      setBaselineIds(nextIds)
      notifySuccess('Matriks akses berhasil disimpan.')
      const affectedUserDapukan =
        user?.dapukan?.id === selectedDapukanId ||
        Boolean(user?.dapukan_list?.some((item) => item.id === selectedDapukanId))
      if (affectedUserDapukan) {
        await refresh()
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan matriks')
    } finally {
      setSaving(false)
    }
  }

  const selectedCount = activeModule
    ? activeModule.permissions.filter((item) => selectedIds.includes(item.id)).length
    : 0
  const moduleOn =
    !!activeModule &&
    selectedCount === activeModule.permissions.length &&
    activeModule.permissions.length > 0
  const modulePartial = !!activeModule && selectedCount > 0 && !moduleOn

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Matriks Hak Akses</h1>
            <p>Atur izin per dapukan: modul, fitur, dan aksi (lihat / buat / ubah / hapus).</p>
          </div>
          <div className="page-header__actions">
            <ExportPrintActions
              title={
                selectedDapukan
                  ? `Matriks Hak Akses — ${selectedDapukan.nama}`
                  : 'Matriks Hak Akses'
              }
              dokumenKey="matriks"
              disabled={loading || !selectedDapukan || hakAksesList.length === 0}
              {...exportAccess}
              getPayload={() => ({
                title: selectedDapukan
                  ? `Matriks Hak Akses — ${selectedDapukan.nama}`
                  : 'Matriks Hak Akses',
                headers: ['Modul', 'Fitur', 'Hak akses', 'Slug', 'Aksi', 'Aktif'],
                columnKeys: ['modul', 'fitur', 'hak_akses', 'slug', 'aksi', 'aktif'],
                rows: hakAksesList.map((item) => [
                  moduleLabel(moduleKeyFromHak(item), item),
                  item.fitur?.nama || '—',
                  item.nama,
                  item.slug,
                  item.aksi,
                  selectedIds.includes(item.id) ? 'Ya' : 'Tidak',
                ]),
              })}
            />
          </div>
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      {loading && <div className="loading-state">Memuat matriks…</div>}

      {!loading && dapukanList.length === 0 && (
        <div className="empty-state">Belum ada data dapukan.</div>
      )}

      {!loading && dapukanList.length > 0 && (
        <>
          <div className="filter-bar filter-bar--legacy">
            <div className="filter-bar__fields">
              <div className="field">
                <label htmlFor="matriks_dapukan">Dapukan</label>
                <SearchableSelect
                  id="matriks_dapukan"
                  value={selectedDapukanId ? String(selectedDapukanId) : ''}
                  onChange={(next) => handleDapukanChange(Number(next))}
                  placeholder="Pilih dapukan"
                  options={dapukanList.map((item) => ({
                    value: String(item.id),
                    label: `${item.nama} (${item.slug})`,
                  }))}
                />
              </div>
              <div className="field">
                <label htmlFor="matriks_cari">Cari di tab aktif</label>
                <input
                  id="matriks_cari"
                  type="search"
                  placeholder="Fitur atau hak akses…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
            {selectedDapukan && (
              <div className="matriks-summary__stats">
                <span>
                  {selectedIds.length}/{hakAksesList.length} izin
                </span>
                {dirty && <span className="badge badge--muted">Belum disimpan</span>}
              </div>
            )}
          </div>

          {hakAksesList.length === 0 ? (
            <div className="empty-state">Belum ada data hak akses.</div>
          ) : modules.length === 0 ? (
            <div className="empty-state">Tidak ada modul yang cocok.</div>
          ) : (
            <div className="form-panel matriks-panel">
              <div className="konfig-tabs" role="tablist" aria-label="Modul hak akses">
                {modules.map((mod) => {
                  const selected = activeTab === mod.key
                  return (
                    <button
                      key={mod.key}
                      type="button"
                      role="tab"
                      id={`${tabsId}-${mod.key}`}
                      className={`konfig-tabs__tab${selected ? ' is-active' : ''}`}
                      aria-selected={selected}
                      aria-controls={`${tabsId}-panel-${mod.key}`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => {
                        setActiveTab(mod.key)
                        setQuery('')
                        setError(null)
                      }}
                    >
                      {mod.label}
                    </button>
                  )
                })}
              </div>

              {activeModule && (
                  <section
                    role="tabpanel"
                    id={`${tabsId}-panel-${activeModule.key}`}
                    aria-labelledby={`${tabsId}-${activeModule.key}`}
                    className="matriks-module matriks-module--tab"
                  >
                    <p className="matriks-module__hint">
                      Jika izin akses modul {activeModule.label.toLowerCase()} dinonaktifkan, maka
                      pengguna tidak bisa mengakses menu terkait dan seluruh fiturnya.
                    </p>

                    <div className="matriks-module__header">
                      <h2>Akses Modul {activeModule.label}</h2>
                      <SwitchToggle
                        checked={moduleOn || modulePartial}
                        disabled={!canUpdate}
                        label={moduleOn || modulePartial ? 'Dizinkan' : 'Ditolak'}
                        onChange={(next) =>
                          setIdsSelection(
                            activeModule.permissions.map((item) => item.id),
                            next,
                          )
                        }
                      />
                    </div>

                    <div className="matriks-module__body">
                      <div className="matriks-module__section-head">
                        <h3>Daftar Fitur</h3>
                      </div>

                      {visibleFitur.length === 0 ? (
                        <div className="empty-state">Tidak ada fitur yang cocok di tab ini.</div>
                      ) : (
                        <div
                          className={`matriks-fitur-list${!moduleOn && !modulePartial ? ' is-muted' : ''}`}
                        >
                          {visibleFitur.map((fitur) => {
                            const fiturKey = `${activeModule.key}:${fitur.slug}`
                            const fiturSelected = fitur.permissions.filter((item) =>
                              selectedIds.includes(item.id),
                            ).length
                            const fiturOn =
                              fiturSelected === fitur.permissions.length &&
                              fitur.permissions.length > 0
                            const fiturPartial = fiturSelected > 0 && !fiturOn
                            const detailRows = buildDetailPermissionRows(fitur)
                            const detailOpen = expandedFitur[fiturKey] === true

                            return (
                              <div
                                key={fiturKey}
                                className={`matriks-fitur${detailOpen ? ' is-open' : ''}`}
                              >
                                <div className="matriks-fitur__row">
                                  {detailRows.length > 0 ? (
                                    <button
                                      type="button"
                                      className="matriks-fitur__toggle"
                                      aria-expanded={detailOpen}
                                      onClick={() =>
                                        setExpandedFitur((prev) => ({
                                          ...prev,
                                          [fiturKey]: !detailOpen,
                                        }))
                                      }
                                    >
                                      <span className="matriks-fitur__chevron" aria-hidden>
                                        ›
                                      </span>
                                      <span className="matriks-fitur__name-text">{fitur.nama}</span>
                                    </button>
                                  ) : (
                                    <div className="matriks-fitur__name">
                                      <span>{fitur.nama}</span>
                                    </div>
                                  )}
                                  <div className="matriks-fitur__controls">
                                    <SwitchToggle
                                      checked={fiturOn || fiturPartial}
                                      disabled={!canUpdate}
                                      label={fiturOn || fiturPartial ? 'Aktif' : 'Nonaktif'}
                                      onChange={(next) =>
                                        setIdsSelection(
                                          fitur.permissions.map((item) => item.id),
                                          next,
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                {detailOpen && detailRows.length > 0 && (
                                  <div className="matriks-aksi-wrap">
                                    <table className="matriks-aksi-table">
                                      <thead>
                                        <tr>
                                          <th scope="col">SUB-FITUR</th>
                                          {ACTION_COLUMNS.map((col) => (
                                            <th key={col.key} scope="col">
                                              {col.label}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {detailRows.map((row) => (
                                          <tr key={row.key}>
                                            <td>
                                              <span className="matriks-aksi-sub">{row.nama}</span>
                                            </td>
                                            {ACTION_COLUMNS.map((col) => {
                                              const permission = row.permissions.find(
                                                (item) => item.aksi === col.key,
                                              )
                                              if (!permission) {
                                                return (
                                                  <td key={col.key} className="matriks-aksi-na">
                                                    —
                                                  </td>
                                                )
                                              }
                                              const checked = selectedIds.includes(permission.id)
                                              return (
                                                <td key={col.key}>
                                                  <label className="matriks-aksi-check">
                                                    <input
                                                      type="checkbox"
                                                      checked={checked}
                                                      disabled={!canUpdate}
                                                      onChange={() =>
                                                        toggleDetailPermission(row, permission)
                                                      }
                                                      aria-label={`${row.nama} · ${col.label}`}
                                                    />
                                                    <span
                                                      className={`matriks-check${checked ? ' is-on' : ''}`}
                                                      aria-hidden
                                                    >
                                                      {checked ? '✓' : ''}
                                                    </span>
                                                  </label>
                                                </td>
                                              )
                                            })}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </section>
              )}
            </div>
          )}

          {canUpdate && hakAksesList.length > 0 && (
            <div className="matriks-actions">
              <p className="field-hint">
                {dirty
                  ? 'Ada perubahan belum disimpan.'
                  : 'Tidak ada perubahan pada dapukan ini.'}
              </p>
              <div className="matriks-actions__buttons">
                <button
                  type="button"
                  className="btn btn--secondary"
                  disabled={!dirty || saving}
                  onClick={resetChanges}
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={saving || !selectedDapukanId || !dirty}
                  onClick={() => void handleSave()}
                >
                  {saving ? 'Menyimpan…' : 'Simpan matriks'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
