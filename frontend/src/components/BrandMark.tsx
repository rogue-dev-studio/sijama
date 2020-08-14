/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 18:03:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-02 18:03:00
 */
type BrandMarkProps = {
  size?: number
  className?: string
}

export function BrandMark({ size = 28, className }: BrandMarkProps) {
  return (
    <img
      src="/logo.svg"
      alt=""
      width={size}
      height={size}
      className={className}
      decoding="async"
    />
  )
}
