/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 22:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-02 22:55:00
 */
type DeveloperFooterProps = {
  className?: string
  compact?: boolean
}

export function DeveloperFooter({ className = '', compact = false }: DeveloperFooterProps) {
  return (
    <footer className={`developer-footer${compact ? ' developer-footer--compact' : ''} ${className}`.trim()}>
      <p className="developer-footer__line">
        Dikembangkan oleh{' '}
        <a
          href="https://github.com/rogue-dev-studio"
          target="_blank"
          rel="noopener noreferrer"
        >
          Rogue Development
        </a>
      </p>
      {!compact && (
        <p className="developer-footer__meta">Rogue Dev Studio · @rogue-dev-studio</p>
      )}
    </footer>
  )
}
