/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 18:03:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-05 21:45:00
 */

import { useState } from 'react'
import { resolveKonfigAssetUrl } from '../lib/konfigAsset'

const DEFAULT_BRAND_MARK = '/logo.svg'

type BrandMarkProps = {
  size?: number
  className?: string
  src?: string | null
  alt?: string
}

export function BrandMark({ size = 28, className, src, alt = '' }: BrandMarkProps) {
  const resolved = resolveKonfigAssetUrl(src)
  const [failed, setFailed] = useState(false)
  const displaySrc = !failed && resolved ? resolved : DEFAULT_BRAND_MARK

  return (
    <img
      src={displaySrc}
      alt={alt}
      width={size}
      height={size}
      className={className}
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
