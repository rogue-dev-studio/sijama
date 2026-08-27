/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 18:03:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 11:36:00
 */

import { resolveKonfigAssetUrl } from '../lib/konfigAsset'

type BrandMarkProps = {
  size?: number
  className?: string
  src?: string | null
  alt?: string
}

export function BrandMark({ size = 28, className, src, alt = '' }: BrandMarkProps) {
  const resolved = resolveKonfigAssetUrl(src)
  if (!resolved) {
    return null
  }

  return (
    <img
      src={resolved}
      alt={alt}
      width={size}
      height={size}
      className={className}
      decoding="async"
    />
  )
}
