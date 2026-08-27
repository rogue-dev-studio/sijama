/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:24:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 11:24:00
 */

import type { ReactNode } from 'react'
import { useAppSettings } from '../auth/AppSettingsContext'
import { resolveKonfigAssetUrl } from '../lib/konfigAsset'

type DeveloperFooterProps = {
  className?: string
  compact?: boolean
}

function resolveDeveloperHref(website?: string | null, footerLink?: string | null): string | null {
  const href = website?.trim() || footerLink?.trim()
  return href || null
}

function renderFooterDetail(
  detail: string,
  detailLink?: string | null,
): ReactNode {
  const text = detail.trim()
  const href = detailLink?.trim()
  if (!text) {
    return null
  }

  const separator = ' · '
  const splitAt = text.lastIndexOf(separator)
  if (href && splitAt > -1) {
    const prefix = text.slice(0, splitAt)
    const suffix = text.slice(splitAt + separator.length)
    return (
      <>
        {prefix}
        {separator}
        <a href={href} target="_blank" rel="noopener noreferrer">
          {suffix}
        </a>
      </>
    )
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {text}
      </a>
    )
  }

  return text
}

export function DeveloperFooter({ className = '', compact = false }: DeveloperFooterProps) {
  const { settings } = useAppSettings()
  const developerName = settings.footer?.trim() || 'Rogue Development'
  const developerHref = resolveDeveloperHref(settings.website, settings.footer_link)
  const footerDetail = settings.footer_detail?.trim() || 'Rogue Dev Studio · @rogue-dev-studio'
  const detailNode = renderFooterDetail(footerDetail, settings.footer_detail_link)
  const footerLogo = settings.path_logofooter?.trim()
    ? resolveKonfigAssetUrl(settings.path_logofooter)
    : null

  return (
    <footer className={`developer-footer${compact ? ' developer-footer--compact' : ''} ${className}`.trim()}>
      {footerLogo && !compact && (
        <img src={footerLogo} alt="" className="developer-footer__logo" decoding="async" />
      )}
      <p className="developer-footer__line">
        Dikembangkan oleh{' '}
        {developerHref ? (
          <a href={developerHref} target="_blank" rel="noopener noreferrer">
            {developerName}
          </a>
        ) : (
          developerName
        )}
      </p>
      {!compact && detailNode && <p className="developer-footer__meta">{detailNode}</p>}
    </footer>
  )
}
