/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 16:14:05
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:41:32
 */

import { useEffect, useMemo, useState, type FormEvent } from 'react'
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
import { KonfigImageUpload } from '../components/KonfigImageUpload'
import { useToast } from '../components/ToastProvider'
import { resolveKonfigAssetUrl } from '../lib/konfigAsset'
import {
  DOKUMEN_LAYOUT_OPTIONS,
  layoutUsesLogos,
  normalizeDokumenLayout,
  resolveLayoutLogos,
} from '../lib/dokumenLayout'

const DEFAULT_STYLE: DokumenHeaderStyle = {
  header_font_size: 17,
  header_font_weight: '650',
  header_align: 'center',
  header_detail_font_size: 14,
  header_detail_font_weight: '400',
  header_detail_color: '#444444',
  logo_max_height: 64,
  footer_font_size: 13,
}

const FONT_WEIGHTS = ['400', '500', '600', '650', '700', '800'] as const

type PendingAssets = Partial<Record<KonfigDokumenAssetKind, File | null>>
type PendingDeletes = Partial<Record<KonfigDokumenAssetKind, boolean>>

function normalizeStyle(raw?: Partial<DokumenHeaderStyle> | null): DokumenHeaderStyle {
  return {
    ...DEFAULT_STYLE,
    ...(raw || {}),
    header_align:
      raw?.header_align === 'left' || raw?.header_align === 'right' || raw?.header_align === 'center'
        ? raw.header_align
        : DEFAULT_STYLE.header_align,
  }
}

export function AplikasiKonfigDokumenFormPage() {
  const { lookupId } = useParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const { refreshSettings } = useAppSettings()
  const { notifySaved } = useToast()
  const canUpdate = can('konfig_dokumen.update')
  const canIsi = can('konfig_dokumen.isi.view')
  const canMedia = can('konfig_dokumen.media.view')
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
        setLabel(item.lookup_name || item.nama || `Lookup #${item.lookup_id}`)
        setValueKey(item.lookup_value || '')
        setLogoKiri(item.path_logo_kiri || null)
        setLogoKanan(item.path_logo_kanan || null)
        setForm({
          lookup_id: item.lookup_id,
          header: item.header || '',
          header_detail: item.header_detail || '',
          footer: item.footer || '',
          footer_detail: item.footer_detail || '',
          layout_mode: normalizeDokumenLayout(item.layout_mode),
          header_style: normalizeStyle(item.header_style),
          apply_pdf: item.apply_pdf,
          apply_excel: item.apply_excel,
          apply_csv: item.apply_csv,
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
      const style = normalizeStyle(prev.header_style)
      return { ...prev, header_style: { ...style, [key]: value } }
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

  const previewStyle = useMemo(
    () => normalizeStyle(form?.header_style),
    [form?.header_style],
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
        footer: form.footer || null,
        footer_detail: form.footer_detail || null,
        layout_mode: normalizeDokumenLayout(form.layout_mode),
        header_style: normalizeStyle(form.header_style),
        apply_pdf: Boolean(form.apply_pdf),
        apply_excel: Boolean(form.apply_excel),
        apply_csv: Boolean(form.apply_csv),
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
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan konfigurasi dokumen')
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

  const style = normalizeStyle(form.header_style)
  const layoutMode = normalizeDokumenLayout(form.layout_mode)
  const showLogos = layoutUsesLogos(layoutMode)
  const previewLogos = resolveLayoutLogos(layoutMode, previewLogoKiri, previewLogoKanan)
  const layoutHint =
    DOKUMEN_LAYOUT_OPTIONS.find((option) => option.value === layoutMode)?.hint || ''

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

      <form className="form-panel" onSubmit={handleSubmit}>
        {canIsi && (
          <fieldset disabled={!canUpdate || submitting}>
            <legend className="form-section-title">Isi dokumen</legend>
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
            <div className="field">
              <label htmlFor="dok-footer">Footer</label>
              <input
                id="dok-footer"
                value={form.footer || ''}
                onChange={(event) => setField('footer', event.target.value)}
              />
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

            <div className="form-section-title" style={{ marginTop: '1rem' }}>
              Gaya tipografi
            </div>
            <div className="form-grid form-grid--2">
              <div className="field">
                <label htmlFor="dok-header-size">Ukuran font header (px)</label>
                <input
                  id="dok-header-size"
                  type="number"
                  min={8}
                  max={48}
                  value={style.header_font_size}
                  onChange={(event) => setStyleField('header_font_size', Number(event.target.value))}
                />
              </div>
              <div className="field">
                <label htmlFor="dok-header-weight">Berat font header</label>
                <select
                  id="dok-header-weight"
                  value={style.header_font_weight}
                  onChange={(event) => setStyleField('header_font_weight', event.target.value)}
                >
                  {FONT_WEIGHTS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="dok-header-align">Perataan teks header</label>
                <select
                  id="dok-header-align"
                  value={style.header_align}
                  onChange={(event) =>
                    setStyleField('header_align', event.target.value as DokumenHeaderStyle['header_align'])
                  }
                >
                  <option value="left">Kiri</option>
                  <option value="center">Tengah</option>
                  <option value="right">Kanan</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="dok-detail-size">Ukuran font detail header (px)</label>
                <input
                  id="dok-detail-size"
                  type="number"
                  min={8}
                  max={36}
                  value={style.header_detail_font_size}
                  onChange={(event) =>
                    setStyleField('header_detail_font_size', Number(event.target.value))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="dok-detail-weight">Berat font detail</label>
                <select
                  id="dok-detail-weight"
                  value={style.header_detail_font_weight}
                  onChange={(event) => setStyleField('header_detail_font_weight', event.target.value)}
                >
                  {FONT_WEIGHTS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="dok-detail-color">Warna detail header</label>
                <input
                  id="dok-detail-color"
                  type="color"
                  value={style.header_detail_color}
                  onChange={(event) => setStyleField('header_detail_color', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="dok-logo-h">Tinggi maks. logo (px)</label>
                <input
                  id="dok-logo-h"
                  type="number"
                  min={24}
                  max={160}
                  value={style.logo_max_height}
                  onChange={(event) => setStyleField('logo_max_height', Number(event.target.value))}
                />
              </div>
              <div className="field">
                <label htmlFor="dok-footer-size">Ukuran font footer (px)</label>
                <input
                  id="dok-footer-size"
                  type="number"
                  min={8}
                  max={24}
                  value={style.footer_font_size}
                  onChange={(event) => setStyleField('footer_font_size', Number(event.target.value))}
                />
              </div>
            </div>
          </fieldset>
        )}

        {canMedia && (
          <fieldset disabled={!canUpdate || submitting} className="konfig-dokumen-media">
            <legend className="form-section-title">Logo & media</legend>
            {showLogos ? (
              <>
                <p className="field-hint">
                  Logo dipakai pada jenis kop yang dipilih saat Cetak/PDF. Unggah PNG/JPG/WebP dengan
                  kontras jelas (hindari SVG dekoratif transparan).
                </p>
                <div className="form-grid form-grid--2">
                  <KonfigImageUpload
                    label="Logo kiri"
                    asset="logo-kiri"
                    savedPath={logoKiri}
                    pendingFile={pendingAssets['logo-kiri'] || null}
                    markedForDelete={Boolean(pendingDeletes['logo-kiri'])}
                    disabled={!canUpdate || submitting}
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
                    disabled={!canUpdate || submitting}
                    pendingSaveLabel="Simpan"
                    hint="Opsional; kosongkan jika tidak dipakai."
                    onFileSelected={(file) => {
                      setPendingAssets((prev) => ({ ...prev, 'logo-kanan': file }))
                      if (file) setPendingDeletes((prev) => ({ ...prev, 'logo-kanan': false }))
                    }}
                    onMarkDelete={() => setPendingDeletes((prev) => ({ ...prev, 'logo-kanan': true }))}
                    onCancelDelete={() => setPendingDeletes((prev) => ({ ...prev, 'logo-kanan': false }))}
                  />
                </div>
              </>
            ) : (
              <p className="field-hint">
                Jenis <strong>Biasa</strong> tidak menampilkan logo. Pilih jenis kop lain untuk mengunggah
                logo kiri/kanan.
              </p>
            )}
            <div className="form-section-title" style={{ marginTop: '1rem' }}>
              Aktifkan di media
            </div>
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
          </fieldset>
        )}

        {(canIsi || canMedia) && (
          <div className="dokumen-kop-preview" aria-live="polite">
            <p className="form-section-title">Pratinjau kop</p>
            <div
              className={`dokumen-kop-preview__sheet dokumen-kop-preview__sheet--${layoutMode}`}
              style={{
                ['--dok-header-size' as string]: `${previewStyle.header_font_size}px`,
                ['--dok-header-weight' as string]: previewStyle.header_font_weight,
                ['--dok-header-align' as string]: previewStyle.header_align,
                ['--dok-detail-size' as string]: `${previewStyle.header_detail_font_size}px`,
                ['--dok-detail-weight' as string]: previewStyle.header_detail_font_weight,
                ['--dok-detail-color' as string]: previewStyle.header_detail_color,
                ['--dok-logo-h' as string]: `${previewStyle.logo_max_height}px`,
                ['--dok-footer-size' as string]: `${previewStyle.footer_font_size}px`,
              }}
            >
              <header className="dokumen-kop-preview__brand">
                {layoutMode === 'biasa' && (
                  <div className="dokumen-kop-preview__text dokumen-kop-preview__text--solo">
                    <p className="dokumen-kop-preview__title">{form.header || '—'}</p>
                    <p className="dokumen-kop-preview__detail">{form.header_detail || ''}</p>
                  </div>
                )}
                {layoutMode === 'kop_atas' && (
                  <>
                    <div className="dokumen-kop-preview__logos-top">
                      {previewLogos.left ? <img src={previewLogos.left} alt="" /> : null}
                      {previewLogos.right ? <img src={previewLogos.right} alt="" /> : null}
                    </div>
                    <div className="dokumen-kop-preview__text dokumen-kop-preview__text--solo">
                      <p className="dokumen-kop-preview__title">{form.header || '—'}</p>
                      <p className="dokumen-kop-preview__detail">{form.header_detail || ''}</p>
                    </div>
                  </>
                )}
                {layoutMode === 'kop_kiri' && (
                  <div className="dokumen-kop-preview__row">
                    <div className="dokumen-kop-preview__logo">
                      {previewLogos.left ? <img src={previewLogos.left} alt="" /> : null}
                    </div>
                    <div className="dokumen-kop-preview__text">
                      <p className="dokumen-kop-preview__title">{form.header || '—'}</p>
                      <p className="dokumen-kop-preview__detail">{form.header_detail || ''}</p>
                    </div>
                  </div>
                )}
                {layoutMode === 'kop_kanan' && (
                  <div className="dokumen-kop-preview__row">
                    <div className="dokumen-kop-preview__text">
                      <p className="dokumen-kop-preview__title">{form.header || '—'}</p>
                      <p className="dokumen-kop-preview__detail">{form.header_detail || ''}</p>
                    </div>
                    <div className="dokumen-kop-preview__logo">
                      {previewLogos.right ? <img src={previewLogos.right} alt="" /> : null}
                    </div>
                  </div>
                )}
                {layoutMode === 'kop_ganda' && (
                  <div className="dokumen-kop-preview__row">
                    <div className="dokumen-kop-preview__logo">
                      {previewLogos.left ? <img src={previewLogos.left} alt="" /> : null}
                    </div>
                    <div className="dokumen-kop-preview__text">
                      <p className="dokumen-kop-preview__title">{form.header || '—'}</p>
                      <p className="dokumen-kop-preview__detail">{form.header_detail || ''}</p>
                    </div>
                    <div className="dokumen-kop-preview__logo">
                      {previewLogos.right ? <img src={previewLogos.right} alt="" /> : null}
                    </div>
                  </div>
                )}
              </header>
              <p className="dokumen-kop-preview__footer">
                {[form.footer, form.footer_detail].filter(Boolean).join(' · ') || 'Footer…'}
              </p>
            </div>
          </div>
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
