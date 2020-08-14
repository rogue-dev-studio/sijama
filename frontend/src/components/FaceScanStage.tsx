/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 20:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-02 22:10:00
 */
import { useEffect, useRef, type ReactNode, type RefObject } from 'react'

type FaceScanStageProps = {
  videoRef: RefObject<HTMLVideoElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  className?: string
  videoClassName?: string
  ariaLabel?: string
  tracking?: boolean
  validity?: 'idle' | 'invalid' | 'valid'
  /** 0–1 circular validation/save progress. */
  progress?: number
  /** Hide loader and show completion copy. */
  complete?: boolean
  /** Override bottom guide label. */
  guideLabel?: string | null
  footer?: ReactNode
}

const LOADER_RADIUS = 42
const LOADER_CIRCUMFERENCE = 2 * Math.PI * LOADER_RADIUS

export function FaceScanStage({
  videoRef,
  canvasRef,
  className = '',
  videoClassName = '',
  ariaLabel = 'Kamera wajah',
  tracking = false,
  validity = 'idle',
  progress = 0,
  complete = false,
  guideLabel = null,
  footer,
}: FaceScanStageProps) {
  const viewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const sync = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return
      const width = video.clientWidth
      const height = video.clientHeight
      if (width < 2 || height < 2) return
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
    }

    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [canvasRef, videoRef])

  const validityClass =
    validity === 'valid'
      ? ' face-scan__viewport--valid'
      : validity === 'invalid'
        ? ' face-scan__viewport--invalid'
        : ''

  const clampedProgress = Math.max(0, Math.min(1, progress))
  const progressActive = !complete && clampedProgress > 0.001
  const progressClass = progressActive ? ' face-scan__viewport--progress' : ''
  const percent = Math.round(clampedProgress * 100)
  const dashOffset = LOADER_CIRCUMFERENCE * (1 - clampedProgress)

  return (
    <div className={`face-scan ${className}`.trim()}>
      <div
        ref={viewportRef}
        className={`face-scan__viewport${tracking ? ' face-scan__viewport--tracking' : ''}${validityClass}${progressClass}`}
      >
        <video
          ref={videoRef}
          className={`camera-video face-scan__video ${videoClassName}`.trim()}
          playsInline
          muted
          aria-label={ariaLabel}
        />
        <canvas ref={canvasRef} className="face-scan__canvas" aria-hidden />

        {progressActive && (
          <div className="face-scan__loader" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <svg className="face-scan__loader-ring" viewBox="0 0 100 100" aria-hidden>
              <circle className="face-scan__loader-track" cx="50" cy="50" r={LOADER_RADIUS} />
              <circle
                className="face-scan__loader-bar"
                cx="50"
                cy="50"
                r={LOADER_RADIUS}
                strokeDasharray={LOADER_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <span className="face-scan__loader-pct">{percent}%</span>
          </div>
        )}

        <p className="face-scan__guide-label">
          {guideLabel
            ? guideLabel
            : complete
              ? 'Pendaftaran selesai'
              : progressActive
                ? percent >= 100
                  ? 'Menyimpan…'
                  : 'Memvalidasi wajah…'
                : 'Hadapkan wajah ke kamera'}
        </p>
      </div>
      {footer}
    </div>
  )
}
