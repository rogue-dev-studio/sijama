/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 15:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 15:20:00
 */

import { useEffect, useId, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { aplikasiKonfigDokumenService } from '../api/services'
import type {
  DokumenHeaderStyle,
  DokumenLayoutMode,
  KonfigDokumenAssetKind,
  KonfigDokumenInput,
} from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { useAppSettings } from '../auth/AppSettingsContext'
import { DokumenFormatBar } from '../components/DokumenFormatBar'
import { DokumenFullPreview } from '../components/DokumenFullPreview'
import { KonfigImageUpload } from '../components/KonfigImageUpload'
import { useToast } from '../components/ToastProvider'
import {
  DOKUMEN_EXPORT_MEDIA,
  getDokumenColumns,
  normalizeColumnVisibilityByMedia,
  type DokumenExportMedia,
} from '../lib/dokumenColumnRegistry'
import { resolveKonfigAssetUrl } from '../lib/konfigAsset'
import {
  DEFAULT_GENERATED_BY_PREFIX,
  DEFAULT_PRINT_DATE_LABEL,
  formatGeneratedByLine,
  resolveGeneratedByPrefix,
} from '../lib/dokumenPrintMeta'
import {
  DOKUMEN_PAPER_ORIENTATIONS,
  DOKUMEN_PAPER_SIZES,
  DOKUMEN_SIGN_ALIGNS,
  DOKUMEN_SIGN_META_LAYOUTS,
  DOKUMEN_SIGN_META_ORDERS,
  formatSignLayoutLabel,
  normalizeDokumenHeaderStyle,
  normalizeDokumenPaper,
  resolveDokumenPaper,
} from '../lib/dokumenStyle'
import {
  DOKUMEN_LAYOUT_OPTIONS,
  layoutUsesLogos,
  normalizeDokumenLayout,
} from '../lib/dokumenLayout'

type DokumenFormTab = 'header' | 'footer' | 'isi' | 'info'
type PendingAssets = Partial<Record<KonfigDokumenAssetKind, File | null>>
type PendingDeletes = Partial<Record<KonfigDokumenAssetKind, boolean>>

const TAB_ITEMS: Array<{ id: DokumenFormTab; label: string }> = [
  { id: 'header', label: 'Header' },
  { id: 'footer', label: 'Footer' },
  { id: 'isi', label: 'Isi dokumen' },
  { id: 'info', label: 'Informasi cetak' },
]

export function AplikasiKonfigDokumenFormPage() {
  const { lookupId } = useParams()
  const navigate = useNavigate()
  const tabsId = useId()
  const { can, user } = useAuth()
  const { refreshSettings, settings } = useAppSettings()
  const { notifySaved } = useToast()
  const canUpdate = can('konfig_dokumen.update')
  const canIsi = can('konfig_dokumen.isi.view')
  const canMedia = can('konfig_dokumen.media.view')
  const [tab, setTab] = useState<DokumenFormTab>('header')
  const [label, setLabel] = useState('')
  const [valueKey, setValueKey] = useState('')
  const [form, setForm] = useState<KonfigDokumenInput | null>(null)
  const [logoKiri, setLogoKiri] = useState<string | null>(null)
  const [logoKanan, setLogoKanan] = useState<string | null>(null)
  const [pendingAssets, setPendingAssets] = useState<PendingAssets>({})
  const [pendingDeletes, setPendingDeletes] = useState<PendingDeletes>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const id = Number(lookupId)
        if (!id) throw new Error('Lookup tidak valid')
        const item = await aplikasiKonfigDokumenService.get(id)
        if (!active) return
        const lookupValue = item.lookup_value || ''
        setLabel(item.lookup_name || item.nama || `Lookup #${item.lookup_id}`)
        setValueKey(lookupValue)
        setLogoKiri(item.path_logo_kiri || null)
        setLogoKanan(item.path_logo_kanan || null)
        const paper = resolveDokumenPaper(item)
        setForm({
          lookup_id: item.lookup_id,
          header: item.header || '',
          header_detail: item.header_detail || '',
          footer: resolveGeneratedByPrefix(item.footer),
          footer_detail: item.footer_detail || '',
          layout_mode: normalizeDokumenLayout(item.layout_mode),
          header_style: normalizeDokumenHeaderStyle(item.header_style),
          paper_size: paper.paper_size,
          paper_orientation: paper.paper_orientation,
          apply_pdf: item.apply_pdf,
          apply_excel: item.apply_excel,
          apply_csv: item.apply_csv,
          show_print_date: item.show_print_date !== false,
          print_date_label: item.print_date_label ?? DEFAULT_PRINT_DATE_LABEL,
          show_print_row_count: item.show_print_row_count !== false,
          show_generated_by: item.show_generated_by !== false,
          column_visibility: normalizeColumnVisibilityByMedia(lookupValue, item.column_visibility),
          show_user_signature: Boolean(item.show_user_signature),
          show_user_name: Boolean(item.show_user_name),
          show_user_phone: Boolean(item.show_user_phone),
          is_active: item.is_active !== false,
        })
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat konfigurasi dokumen')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [lookupId])

  function setField<K extends keyof KonfigDokumenInput>(key: K, value: KonfigDokumenInput[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  function setStyleField<K extends keyof DokumenHeaderStyle>(key: K, value: DokumenHeaderStyle[K]) {
    setForm((prev) => {
      if (!prev) return prev
      const style = normalizeDokumenHeaderStyle(prev.header_style)
      return { ...prev, header_style: { ...style, [key]: value } }
    })
  }

  function setColumnVisible(media: DokumenExportMedia, columnKey: string, visible: boolean) {
    setForm((prev) => {
      if (!prev) return prev
      const current = normalizeColumnVisibilityByMedia(valueKey, prev.column_visibility)
      return {
        ...prev,
        column_visibility: {
          ...current,
          [media]: {
            ...(current[media] || {}),
            [columnKey]: visible,
          },
        },
      }
    })
  }

  const [previewLogoKiri, setPreviewLogoKiri] = useState<string | null>(null)
  const [previewLogoKanan, setPreviewLogoKanan] = useState<string | null>(null)

  useEffect(() => {
    if (pendingDeletes['logo-kiri']) {
      setPreviewLogoKiri(null)
      return
    }
    const file = pendingAssets['logo-kiri']
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewLogoKiri(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewLogoKiri(resolveKonfigAssetUrl(logoKiri))
  }, [logoKiri, pendingAssets, pendingDeletes])

  useEffect(() => {
    if (pendingDeletes['logo-kanan']) {
      setPreviewLogoKanan(null)
      return
    }
    const file = pendingAssets['logo-kanan']
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewLogoKanan(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewLogoKanan(resolveKonfigAssetUrl(logoKanan))
  }, [logoKanan, pendingAssets, pendingDeletes])

  const previewPaper = useMemo(
    () =>
      normalizeDokumenPaper({
        paper_size: form?.paper_size,
        paper_orientation: form?.paper_orientation,
      }),
    [form?.paper_orientation, form?.paper_size],
  )

  const previewStyle = useMemo(
    () => normalizeDokumenHeaderStyle(form?.header_style),
    [form?.header_style],
  )

  const tableColumns = useMemo(() => getDokumenColumns(valueKey), [valueKey])
  const columnVisibilityByMedia = useMemo(
    () => normalizeColumnVisibilityByMedia(valueKey, form?.column_visibility),
    [valueKey, form?.column_visibility],
  )

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canUpdate || !form) return
    setSubmitting(true)
    setError(null)
    try {
      const saved = await aplikasiKonfigDokumenService.update({
        lookup_id: form.lookup_id,
        header: form.header || null,
        header_detail: form.header_detail || null,
        footer: resolveGeneratedByPrefix(form.footer) || null,
        footer_detail: form.footer_detail || null,
        layout_mode: normalizeDokumenLayout(form.layout_mode),
        header_style: normalizeDokumenHeaderStyle(form.header_style),
        paper_size: previewPaper.paper_size,
        paper_orientation: previewPaper.paper_orientation,
        apply_pdf: Boolean(form.apply_pdf),
        apply_excel: Boolean(form.apply_excel),
        apply_csv: Boolean(form.apply_csv),
        show_print_date: form.show_print_date !== false,
        print_date_label: form.print_date_label?.trim() || null,
        show_print_row_count: form.show_print_row_count !== false,
        show_generated_by: form.show_generated_by !== false,
        column_visibility: form.column_visibility ?? null,
        show_user_signature: Boolean(form.show_user_signature),
        show_user_name: Boolean(form.show_user_name),
        show_user_phone: Boolean(form.show_user_phone),
        is_active: form.is_active !== false,
      })

      let nextKiri = saved.path_logo_kiri ?? logoKiri
      let nextKanan = saved.path_logo_kanan ?? logoKanan

      for (const asset of ['logo-kiri', 'logo-kanan'] as KonfigDokumenAssetKind[]) {
        if (pendingDeletes[asset] && !pendingAssets[asset]) {
          const result = await aplikasiKonfigDokumenService.deleteAsset(form.lookup_id, asset)
          if (asset === 'logo-kiri') nextKiri = result.path_logo_kiri ?? null
          if (asset === 'logo-kanan') nextKanan = result.path_logo_kanan ?? null
        }
        const file = pendingAssets[asset]
        if (file) {
          const result = await aplikasiKonfigDokumenService.uploadAsset(form.lookup_id, asset, file)
          if (asset === 'logo-kiri') nextKiri = result.path_logo_kiri ?? null
          if (asset === 'logo-kanan') nextKanan = result.path_logo_kanan ?? null
        }
      }

      setLogoKiri(nextKiri)
      setLogoKanan(nextKanan)
      await refreshSettings()
      notifySaved('konfigurasi dokumen', 'update')
      navigate('/aplikasi/konfig-dokumen')
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const detail = Object.values(err.errors).flat().join(' ')
        setError(detail || err.message)
      } else {
        setError(err instanceof ApiError ? err.message : 'Gagal menyimpan konfigurasi dokumen')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading-state">Memuat konfigurasi dokumen…</div>
  }

  if (!form) {
    return (
      <>
        {error && <div className="alert alert--error">{error}</div>}
        <Link to="/aplikasi/konfig-dokumen" className="btn btn--secondary">
          Kembali
        </Link>
      </>
    )
  }

  const style = normalizeDokumenHeaderStyle(form.header_style)
  const layoutMode = normalizeDokumenLayout(form.layout_mode)
  const showLogos = layoutUsesLogos(layoutMode)
  const layoutHint =
    DOKUMEN_LAYOUT_OPTIONS.find((option) => option.value === layoutMode)?.hint || ''
  const disabled = !canUpdate || submitting
  const visibleTabs = TAB_ITEMS.filter((item) => {
    if (item.id === 'isi' || item.id === 'header' || item.id === 'footer') return canIsi
    return canIsi || canMedia
  })

  return (
    <>
      <header className="page-header">
        <h1>{canUpdate ? 'Ubah' : 'Lihat'} konfigurasi dokumen</h1>
        <p>
          {label}
          {valueKey ? (
            <>
              {' '}
              · value <code>{valueKey}</code>
            </>
          ) : null}
        </p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel konfig-dokumen-form" onSubmit={handleSubmit}>
        {visibleTabs.length > 0 && (
          <div className="konfig-tabs" role="tablist" aria-label="Kategori konfigurasi dokumen">
            {visibleTabs.map((item) => {
              const selected = tab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`${tabsId}-${item.id}`}
                  className={`konfig-tabs__tab${selected ? ' is-active' : ''}`}
                  aria-selected={selected}
                  aria-controls={`${tabsId}-panel-${item.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        )}

        {canIsi && (
          <>
            <fieldset
              disabled={disabled}
              role="tabpanel"
              id={`${tabsId}-panel-header`}
              aria-labelledby={`${tabsId}-header`}
              hidden={tab !== 'header'}
              className="konfig-dokumen-form__panel"
            >
              <div className="field">
                <label htmlFor="dok-layout">Jenis tampilan kop</label>
                <select
                  id="dok-layout"
                  value={layoutMode}
                  onChange={(event) =>
                    setField('layout_mode', normalizeDokumenLayout(event.target.value) as DokumenLayoutMode)
                  }
                >
                  {DOKUMEN_LAYOUT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {layoutHint ? <p className="field-hint">{layoutHint}</p> : null}
              </div>
              <div className="field">
                <label htmlFor="dok-header">Header</label>
                <input
                  id="dok-header"
                  value={form.header || ''}
                  onChange={(event) => setField('header', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="dok-header-detail">Detail header</label>
                <textarea
                  id="dok-header-detail"
                  rows={2}
                  value={form.header_detail || ''}
                  onChange={(event) => setField('header_detail', event.target.value)}
                />
              </div>

              {canMedia && showLogos && (
                <>
                  <p className="field-hint">
                    Logo dipakai pada jenis kop yang dipilih saat Cetak/PDF.
                  </p>
                  <div className="form-grid form-grid--2">
                    <KonfigImageUpload
                      label="Logo kiri"
                      asset="logo-kiri"
                      savedPath={logoKiri}
                      pendingFile={pendingAssets['logo-kiri'] || null}
                      markedForDelete={Boolean(pendingDeletes['logo-kiri'])}
                      disabled={disabled}
                      pendingSaveLabel="Simpan"
                      hint="Contoh: lambang organisasi."
                      onFileSelected={(file) => {
                        setPendingAssets((prev) => ({ ...prev, 'logo-kiri': file }))
                        if (file) setPendingDeletes((prev) => ({ ...prev, 'logo-kiri': false }))
                      }}
                      onMarkDelete={() => setPendingDeletes((prev) => ({ ...prev, 'logo-kiri': true }))}
                      onCancelDelete={() => setPendingDeletes((prev) => ({ ...prev, 'logo-kiri': false }))}
                    />
                    <KonfigImageUpload
                      label="Logo kanan"
                      asset="logo-kanan"
                      savedPath={logoKanan}
                      pendingFile={pendingAssets['logo-kanan'] || null}
                      markedForDelete={Boolean(pendingDeletes['logo-kanan'])}
                      disabled={disabled}
                      pendingSaveLabel="Simpan"
                      hint="Opsional. Kosongkan jika tidak dipakai."
                      onFileSelected={(file) => {
                        setPendingAssets((prev) => ({ ...prev, 'logo-kanan': file }))
                        if (file) setPendingDeletes((prev) => ({ ...prev, 'logo-kanan': false }))
                      }}
                      onMarkDelete={() => setPendingDeletes((prev) => ({ ...prev, 'logo-kanan': true }))}
                      onCancelDelete={() => setPendingDeletes((prev) => ({ ...prev, 'logo-kanan': false }))}
                    />
                  </div>
                </>
              )}

              <div className="form-section-title form-section-title--after-fields">
                Formatting
              </div>
              <DokumenFormatBar
                section="header"
                label="Judul"
                idPrefix="dok-header"
                style={style}
                disabled={disabled}
                onChange={setStyleField}
              />
              <DokumenFormatBar
                section="detail"
                label="Detail"
                idPrefix="dok-detail"
                style={style}
                disabled={disabled}
                onChange={setStyleField}
              />

              <div className="dokumen-format-bar dokumen-format-bar--compact">
                <p className="dokumen-format-bar__label">Logo &amp; garis kop</p>
                <div className="dokumen-format-bar__row">
                  <label className="dokumen-format-bar__mini" title="Tinggi logo (px)">
                    <span>Logo H</span>
                    <input
                      id="dok-logo-h"
                      type="number"
                      min={24}
                      max={160}
                      disabled={disabled}
                      value={style.logo_max_height}
                      onChange={(event) =>
                        setStyleField('logo_max_height', Number(event.target.value))
                      }
                    />
                  </label>
                  <label className="dokumen-format-bar__mini" title="Lebar logo (px)">
                    <span>Logo W</span>
                    <input
                      id="dok-logo-w"
                      type="number"
                      min={40}
                      max={240}
                      disabled={disabled}
                      value={style.logo_max_width}
                      onChange={(event) =>
                        setStyleField('logo_max_width', Number(event.target.value))
                      }
                    />
                  </label>
                  <label className="dokumen-format-bar__mini" title="Ketebalan garis (px)">
                    <span>Garis</span>
                    <input
                      id="dok-brand-border-w"
                      type="number"
                      min={0}
                      max={4}
                      disabled={disabled}
                      value={style.brand_border_width}
                      onChange={(event) =>
                        setStyleField('brand_border_width', Number(event.target.value))
                      }
                    />
                  </label>
                  <label className="dokumen-format-bar__color" title="Warna garis kop">
                    <span className="sr-only">Warna garis kop</span>
                    <input
                      id="dok-brand-border-color"
                      type="color"
                      disabled={disabled}
                      value={style.brand_border_color}
                      onChange={(event) => setStyleField('brand_border_color', event.target.value)}
                    />
                  </label>
                </div>
              </div>

              {canMedia && (
                <>
                  <div className="form-section-title form-section-title--after-fields">
                    Kop aktif di media
                  </div>
                  <p className="field-hint">
                    Menentukan media ekspor/cetak yang menampilkan <strong>kop</strong> (header, logo,
                    footer). Ekspor data tetap tersedia meski kop dimatikan untuk media tersebut.
                  </p>
                  <div className="konfig-dokumen-media-checks">
                    <label className="checkbox-field">
                      <input
                        type="checkbox"
                        checked={Boolean(form.apply_pdf)}
                        onChange={(event) => setField('apply_pdf', event.target.checked)}
                      />
                      <span>PDF / Cetak</span>
                    </label>
                    <label className="checkbox-field">
                      <input
                        type="checkbox"
                        checked={Boolean(form.apply_excel)}
                        onChange={(event) => setField('apply_excel', event.target.checked)}
                      />
                      <span>Excel</span>
                    </label>
                    <label className="checkbox-field">
                      <input
                        type="checkbox"
                        checked={Boolean(form.apply_csv)}
                        onChange={(event) => setField('apply_csv', event.target.checked)}
                      />
                      <span>CSV</span>
                    </label>
                  </div>
                </>
              )}
            </fieldset>

            <fieldset
              disabled={disabled}
              role="tabpanel"
              id={`${tabsId}-panel-footer`}
              aria-labelledby={`${tabsId}-footer`}
              hidden={tab !== 'footer'}
              className="konfig-dokumen-form__panel"
            >
              <div className="field">
                <label htmlFor="dok-footer">Footer (baris pertama)</label>
                <div className="konfig-dokumen-form__generated-by">
                  <input
                    id="dok-footer"
                    value={form.footer || ''}
                    placeholder={DEFAULT_GENERATED_BY_PREFIX}
                    onChange={(event) => setField('footer', event.target.value)}
                  />
                  <span className="konfig-dokumen-form__generated-by-suffix" aria-hidden="true">
                    {' '}
                    oleh {settings.app_nama}
                  </span>
                </div>
                <p className="field-hint">
                  Pratinjau baris pertama:{' '}
                  <strong>{formatGeneratedByLine(form.footer, settings.app_nama)}</strong>
                </p>
              </div>
              <div className="field">
                <label htmlFor="dok-footer-detail">Detail footer</label>
                <textarea
                  id="dok-footer-detail"
                  rows={2}
                  value={form.footer_detail || ''}
                  onChange={(event) => setField('footer_detail', event.target.value)}
                />
              </div>
              <DokumenFormatBar
                section="footer"
                label="Footer"
                idPrefix="dok-footer"
                style={style}
                disabled={disabled}
                onChange={setStyleField}
              />
            </fieldset>

            <fieldset
              disabled={disabled}
              role="tabpanel"
              id={`${tabsId}-panel-isi`}
              aria-labelledby={`${tabsId}-isi`}
              hidden={tab !== 'isi'}
              className="konfig-dokumen-form__panel"
            >
              <div className="form-section-title">Formatting isi dokumen</div>
              <DokumenFormatBar
                section="body"
                label="Tabel & isi"
                idPrefix="dok-body"
                style={style}
                disabled={disabled}
                onChange={setStyleField}
              />

              <div className="form-section-title form-section-title--after-fields">
                Kolom tampil
              </div>
              <p className="field-hint">
                Atur kolom tabel per media ekspor untuk cetakan <code>{valueKey || '—'}</code>.
                Kolom <strong>No</strong> selalu ditampilkan.
              </p>
              {tableColumns.length === 0 ? (
                <p className="empty-state">
                  Daftar kolom belum terdaftar untuk value ini. Tambahkan di registry bila perlu.
                </p>
              ) : (
                DOKUMEN_EXPORT_MEDIA.map((media) => (
                  <div key={media.id} className="konfig-dokumen-columns-group">
                    <p className="form-section-title">{media.label}</p>
                    <div className="konfig-dokumen-columns">
                      {tableColumns.map((column) => (
                        <label key={`${media.id}-${column.key}`} className="checkbox-field">
                          <input
                            type="checkbox"
                            checked={columnVisibilityByMedia[media.id]?.[column.key] !== false}
                            onChange={(event) =>
                              setColumnVisible(media.id, column.key, event.target.checked)
                            }
                          />
                          <span>{column.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </fieldset>
          </>
        )}

        {(canIsi || canMedia) && (
          <fieldset
            disabled={disabled}
            role="tabpanel"
            id={`${tabsId}-panel-info`}
            aria-labelledby={`${tabsId}-info`}
            hidden={tab !== 'info'}
            className="konfig-dokumen-form__panel konfig-dokumen-media"
          >
            <p className="form-section-title">Opsi tampilan</p>
            <p className="field-hint">
              Ukuran kertas disimpan per lookup cetakan (bukan di formatting style). Default awal
              bisa diatur saat menambah lookup tipe <code>konfig_dokumen</code> di Master Lookup.
            </p>
            <div className="dokumen-format-bar dokumen-format-bar--paper">
              <p className="dokumen-format-bar__label">Ukuran kertas</p>
              <div className="dokumen-format-bar__row">
                <select
                  id="dok-paper-size"
                  className="dokumen-format-bar__paper"
                  disabled={disabled}
                  value={form.paper_size ?? previewPaper.paper_size}
                  onChange={(event) =>
                    setField(
                      'paper_size',
                      event.target.value as KonfigDokumenInput['paper_size'],
                    )
                  }
                >
                  {DOKUMEN_PAPER_SIZES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="dokumen-format-bar__group" role="group" aria-label="Orientasi kertas">
                  {DOKUMEN_PAPER_ORIENTATIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`dokumen-format-bar__btn dokumen-format-bar__btn--text${
                        (form.paper_orientation ?? previewPaper.paper_orientation) === option.value
                          ? ' is-active'
                          : ''
                      }`}
                      disabled={disabled}
                      aria-pressed={
                        (form.paper_orientation ?? previewPaper.paper_orientation) === option.value
                      }
                      title={option.label}
                      onClick={() => setField('paper_orientation', option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={form.show_print_date !== false}
                onChange={(event) => setField('show_print_date', event.target.checked)}
              />
              <span>Tampilkan tanggal cetak</span>
            </label>
            {form.show_print_date !== false && (
              <div className="field">
                <label htmlFor="dok-print-date-label">Label tanggal cetak</label>
                <input
                  id="dok-print-date-label"
                  value={form.print_date_label ?? DEFAULT_PRINT_DATE_LABEL}
                  placeholder={DEFAULT_PRINT_DATE_LABEL}
                  onChange={(event) => setField('print_date_label', event.target.value)}
                />
                <p className="field-hint">
                  Contoh: <strong>Dicetak</strong> 30/08/2026, 15.00.00
                </p>
              </div>
            )}
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={form.show_print_row_count !== false}
                onChange={(event) => setField('show_print_row_count', event.target.checked)}
              />
              <span>Tampilkan jumlah baris (mis. · 3 baris)</span>
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={form.show_generated_by !== false}
                onChange={(event) => setField('show_generated_by', event.target.checked)}
              />
              <span>Tampilkan footer dokumen dihasilkan</span>
            </label>
            <p className="field-hint">
              Teks footer diatur di tab <strong>Footer</strong>. Nama aplikasi ditambahkan otomatis
              setelah &quot;oleh …&quot;.
            </p>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={Boolean(form.show_user_signature)}
                onChange={(event) => setField('show_user_signature', event.target.checked)}
              />
              <span>Tampilkan tanda tangan user login</span>
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={Boolean(form.show_user_name)}
                onChange={(event) => setField('show_user_name', event.target.checked)}
              />
              <span>Tampilkan nama user login</span>
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={Boolean(form.show_user_phone)}
                onChange={(event) => setField('show_user_phone', event.target.checked)}
              />
              <span>Tampilkan no. HP user login (jika ada)</span>
            </label>

            <div className="dokumen-format-bar dokumen-format-bar--compact">
              <p className="dokumen-format-bar__label">Tata letak tanda tangan</p>
              <div className="dokumen-format-bar__rows">
                <div className="dokumen-format-bar__row">
                  <span className="dokumen-format-bar__mini dokumen-format-bar__mini--label">
                    Posisi blok
                  </span>
                  <div className="dokumen-format-bar__group" role="group" aria-label="Posisi blok TTD">
                    {DOKUMEN_SIGN_ALIGNS.map((option) => (
                      <button
                        key={`block-${option.value}`}
                        type="button"
                        className={`dokumen-format-bar__btn dokumen-format-bar__btn--text${
                          style.sign_block_position === option.value ? ' is-active' : ''
                        }`}
                        disabled={disabled}
                        aria-pressed={style.sign_block_position === option.value}
                        title={option.label}
                        onClick={() => setStyleField('sign_block_position', option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="dokumen-format-bar__row">
                  <span className="dokumen-format-bar__mini dokumen-format-bar__mini--label">
                    Isi blok
                  </span>
                  <div
                    className="dokumen-format-bar__group"
                    role="group"
                    aria-label="Perataan isi blok TTD"
                  >
                    {DOKUMEN_SIGN_ALIGNS.map((option) => (
                      <button
                        key={`content-${option.value}`}
                        type="button"
                        className={`dokumen-format-bar__btn dokumen-format-bar__btn--text${
                          style.sign_content_align === option.value ? ' is-active' : ''
                        }`}
                        disabled={disabled}
                        aria-pressed={style.sign_content_align === option.value}
                        title={option.label}
                        onClick={() => setStyleField('sign_content_align', option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="dokumen-format-bar__row">
                  <select
                    id="dok-sign-layout"
                    className="dokumen-format-bar__transform"
                    disabled={disabled}
                    value={style.sign_meta_layout}
                    onChange={(event) =>
                      setStyleField(
                        'sign_meta_layout',
                        event.target.value as DokumenHeaderStyle['sign_meta_layout'],
                      )
                    }
                  >
                    {DOKUMEN_SIGN_META_LAYOUTS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    id="dok-sign-order"
                    className="dokumen-format-bar__transform"
                    disabled={disabled}
                    value={style.sign_meta_order}
                    onChange={(event) =>
                      setStyleField(
                        'sign_meta_order',
                        event.target.value as DokumenHeaderStyle['sign_meta_order'],
                      )
                    }
                  >
                    {DOKUMEN_SIGN_META_ORDERS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="field-hint">
                Satu blok untuk tanda tangan, nama, dan nomor HP. Contoh: posisi{' '}
                <strong>Kanan</strong> dengan isi <strong>Kanan</strong> = kanan penuh. Posisi{' '}
                <strong>Kiri</strong> dengan isi <strong>Tengah</strong> = blok di kiri, teks rata
                tengah. Saat ini:{' '}
                <strong>
                  {formatSignLayoutLabel(style.sign_block_position, style.sign_content_align)}
                </strong>
                .
              </p>
            </div>

            <p className="field-hint">
              Tanda tangan, nama, dan no. HP diambil otomatis dari akun yang mencetak. Unggah tanda
              tangan di menu <strong>Profil saya</strong>.
            </p>
          </fieldset>
        )}

        {(canIsi || canMedia) && (
          <DokumenFullPreview
            title={label}
            valueKey={valueKey}
            header={form.header || ''}
            headerDetail={form.header_detail || ''}
            footer={form.footer || ''}
            footerDetail={form.footer_detail || ''}
            layoutMode={layoutMode}
            headerStyle={previewStyle}
            paper={previewPaper}
            logoLeft={previewLogoKiri}
            logoRight={previewLogoKanan}
            columnVisibility={form.column_visibility}
            showPrintDate={form.show_print_date !== false}
            printDateLabel={form.print_date_label}
            showPrintRowCount={form.show_print_row_count !== false}
            showGeneratedBy={form.show_generated_by !== false}
            appName={settings.app_nama}
            showUserSignature={Boolean(form.show_user_signature)}
            showUserName={Boolean(form.show_user_name)}
            showUserPhone={Boolean(form.show_user_phone)}
            printUserName={user?.name ?? null}
            printUserPhone={user?.no_hp ?? null}
            printUserSignatureUrl={resolveKonfigAssetUrl(user?.path_tanda_tangan)}
          />
        )}

        {!canIsi && !canMedia && (
          <div className="empty-state">Tidak ada bagian konfigurasi dokumen yang diizinkan.</div>
        )}

        <div className="form-actions">
          {canUpdate && (canIsi || canMedia) && (
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Menyimpan…' : 'Simpan'}
            </button>
          )}
          <Link to="/aplikasi/konfig-dokumen" className="btn btn--secondary">
            Kembali
          </Link>
        </div>
      </form>
    </>
  )
}
