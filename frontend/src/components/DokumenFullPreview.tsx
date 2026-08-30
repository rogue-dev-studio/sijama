/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 15:02:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 15:02:00
 */

import { useMemo } from 'react'
import type { DokumenHeaderStyle, DokumenLayoutMode, DokumenPaperConfig } from '../api/types'
import {
  getDokumenColumns,
  isDokumenColumnVisible,
  resolveColumnVisibilityForMedia,
  type DokumenColumnVisibilityByMedia,
} from '../lib/dokumenColumnRegistry'
import { resolveLayoutLogos } from '../lib/dokumenLayout'
import { buildPreviewTableRows, PREVIEW_PRINT_USER } from '../lib/dokumenPreviewSample'
import { buildSignMetaLines } from '../lib/dokumenSignBlock'
import {
  DOKUMEN_PAPER_ORIENTATIONS,
  DOKUMEN_PAPER_SIZES,
  dokumenHeaderStyleVars,
  normalizeDokumenHeaderStyle,
} from '../lib/dokumenStyle'
import { formatGeneratedByLine, formatPrintDateMeta } from '../lib/dokumenPrintMeta'

type DokumenFullPreviewProps = {
  title: string
  valueKey: string
  header: string
  headerDetail: string
  footer: string
  footerDetail: string
  layoutMode: DokumenLayoutMode
  headerStyle: DokumenHeaderStyle
  paper: DokumenPaperConfig
  logoLeft: string | null
  logoRight: string | null
  columnVisibility: DokumenColumnVisibilityByMedia | null | undefined
  showPrintDate: boolean
  printDateLabel?: string | null
  showPrintRowCount: boolean
  showGeneratedBy: boolean
  appName: string
  showUserSignature: boolean
  showUserName: boolean
  showUserPhone: boolean
  printUserName?: string | null
  printUserPhone?: string | null
  printUserSignatureUrl?: string | null
}

function KopBrand({
  layoutMode,
  header,
  headerDetail,
  logoLeft,
  logoRight,
}: {
  layoutMode: DokumenLayoutMode
  header: string
  headerDetail: string
  logoLeft: string | null
  logoRight: string | null
}) {
  const logos = resolveLayoutLogos(layoutMode, logoLeft, logoRight)

  return (
    <header className="dokumen-kop-preview__brand">
      {layoutMode === 'biasa' && (
        <div className="dokumen-kop-preview__text dokumen-kop-preview__text--solo">
          <p className="dokumen-kop-preview__title">{header || '—'}</p>
          {headerDetail ? <p className="dokumen-kop-preview__detail">{headerDetail}</p> : null}
        </div>
      )}
      {layoutMode === 'kop_atas' && (
        <>
          <div className="dokumen-kop-preview__logos-top">
            {logos.left ? <img src={logos.left} alt="" /> : null}
            {logos.right ? <img src={logos.right} alt="" /> : null}
          </div>
          <div className="dokumen-kop-preview__text dokumen-kop-preview__text--solo">
            <p className="dokumen-kop-preview__title">{header || '—'}</p>
            {headerDetail ? <p className="dokumen-kop-preview__detail">{headerDetail}</p> : null}
          </div>
        </>
      )}
      {layoutMode === 'kop_kiri' && (
        <div className="dokumen-kop-preview__row">
          <div className="dokumen-kop-preview__logo">
            {logos.left ? <img src={logos.left} alt="" /> : null}
          </div>
          <div className="dokumen-kop-preview__text">
            <p className="dokumen-kop-preview__title">{header || '—'}</p>
            {headerDetail ? <p className="dokumen-kop-preview__detail">{headerDetail}</p> : null}
          </div>
        </div>
      )}
      {layoutMode === 'kop_kanan' && (
        <div className="dokumen-kop-preview__row">
          <div className="dokumen-kop-preview__text">
            <p className="dokumen-kop-preview__title">{header || '—'}</p>
            {headerDetail ? <p className="dokumen-kop-preview__detail">{headerDetail}</p> : null}
          </div>
          <div className="dokumen-kop-preview__logo">
            {logos.right ? <img src={logos.right} alt="" /> : null}
          </div>
        </div>
      )}
      {layoutMode === 'kop_ganda' && (
        <div className="dokumen-kop-preview__row">
          <div className="dokumen-kop-preview__logo">
            {logos.left ? <img src={logos.left} alt="" /> : null}
          </div>
          <div className="dokumen-kop-preview__text">
            <p className="dokumen-kop-preview__title">{header || '—'}</p>
            {headerDetail ? <p className="dokumen-kop-preview__detail">{headerDetail}</p> : null}
          </div>
          <div className="dokumen-kop-preview__logo">
            {logos.right ? <img src={logos.right} alt="" /> : null}
          </div>
        </div>
      )}
    </header>
  )
}

export function DokumenFullPreview({
  title,
  valueKey,
  header,
  headerDetail,
  footer,
  footerDetail,
  layoutMode,
  headerStyle,
  paper,
  logoLeft,
  logoRight,
  columnVisibility,
  showPrintDate,
  printDateLabel,
  showPrintRowCount,
  showGeneratedBy,
  appName,
  showUserSignature,
  showUserName,
  showUserPhone,
  printUserName,
  printUserPhone,
  printUserSignatureUrl,
}: DokumenFullPreviewProps) {
  const style = normalizeDokumenHeaderStyle(headerStyle)
  const styleVars = dokumenHeaderStyleVars(style)

  const paperLabel =
    DOKUMEN_PAPER_SIZES.find((item) => item.value === paper.paper_size)?.label ?? paper.paper_size
  const orientationLabel =
    DOKUMEN_PAPER_ORIENTATIONS.find((item) => item.value === paper.paper_orientation)?.label ??
    paper.paper_orientation

  const visibleColumns = useMemo(() => {
    const allColumns = getDokumenColumns(valueKey)
    const visibility = resolveColumnVisibilityForMedia(columnVisibility, 'pdf', valueKey)
    return allColumns.filter((column) => isDokumenColumnVisible(visibility, column.key))
  }, [columnVisibility, valueKey])

  const tablePreview = useMemo(() => buildPreviewTableRows(visibleColumns), [visibleColumns])

  const printMeta =
    showPrintDate || showPrintRowCount
      ? formatPrintDateMeta({
          label: printDateLabel,
          rowCount: tablePreview.rows.length,
          showDate: showPrintDate,
          showRowCount: showPrintRowCount,
        })
      : null

  const footerLines = showGeneratedBy
    ? [
        formatGeneratedByLine(footer, appName),
        footerDetail.trim(),
      ].filter(Boolean)
    : []

  const previewName = showUserName
    ? printUserName?.trim() || PREVIEW_PRINT_USER.name
    : null
  const previewPhone = showUserPhone
    ? printUserPhone?.trim() || PREVIEW_PRINT_USER.phone
    : null
  const previewSignatureUrl = printUserSignatureUrl?.trim() || null

  const signMetaLines = buildSignMetaLines({
    showName: showUserName,
    showPhone: showUserPhone,
    name: previewName,
    phone: previewPhone,
    layout: style.sign_meta_layout,
    order: style.sign_meta_order,
  })

  const showSignBlock = showUserSignature || signMetaLines.length > 0

  const hasKop = Boolean(header.trim() || headerDetail.trim() || logoLeft || logoRight)

  return (
    <div className="dokumen-full-preview" aria-live="polite">
      <div className="dokumen-full-preview__heading">
        <p className="form-section-title">Pratinjau dokumen</p>
        <p className="dokumen-full-preview__paper">
          {paperLabel} · {orientationLabel}
        </p>
      </div>
      <div className="dokumen-full-preview__frame">
        <article
          className={`dokumen-full-preview__sheet dokumen-full-preview__sheet--${paper.paper_orientation}`}
          style={styleVars}
        >
          {hasKop ? (
            <KopBrand
              layoutMode={layoutMode}
              header={header}
              headerDetail={headerDetail}
              logoLeft={logoLeft}
              logoRight={logoRight}
            />
          ) : null}

          {!hasKop && title.trim() ? (
            <h2 className="dokumen-full-preview__title">{title}</h2>
          ) : null}

          {printMeta ? <p className="dokumen-full-preview__meta">{printMeta}</p> : null}

          <div className="dokumen-full-preview__table-wrap">
            <table className="dokumen-full-preview__table">
              <thead>
                <tr>
                  {tablePreview.headers.map((cell) => (
                    <th key={cell}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tablePreview.rows.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showSignBlock ? (
            <section
              className={`dokumen-full-preview__sign dokumen-full-preview__sign--position-${style.sign_block_position}`}
              aria-label="Tanda tangan"
            >
              <div
                className={`dokumen-full-preview__sign-inner dokumen-full-preview__sign-inner--align-${style.sign_content_align}`}
              >
                {showUserSignature ? (
                  previewSignatureUrl ? (
                    <div className="dokumen-full-preview__sign-image">
                      <img src={previewSignatureUrl} alt="" />
                    </div>
                  ) : (
                    <div className="dokumen-full-preview__sign-sample" aria-hidden="true">
                      {PREVIEW_PRINT_USER.signatureLabel}
                    </div>
                  )
                ) : null}
                {signMetaLines.length > 0 ? (
                  style.sign_meta_layout === 'inline' ? (
                    <p className="dokumen-full-preview__sign-meta dokumen-full-preview__sign-meta--inline">
                      {signMetaLines.join(' · ')}
                    </p>
                  ) : (
                    <div className="dokumen-full-preview__sign-meta-stack">
                      {signMetaLines.map((line) => (
                        <p key={line} className="dokumen-full-preview__sign-meta">
                          {line}
                        </p>
                      ))}
                    </div>
                  )
                ) : null}
              </div>
            </section>
          ) : null}

          {footerLines.length > 0 ? (
            <footer className="dokumen-full-preview__footer">
              {footerLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </footer>
          ) : null}
        </article>
      </div>
    </div>
  )
}
