/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 21:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 18:00:00
 */
import { useEffect, useRef, type RefObject } from 'react'
import { TinyFaceDetectorOptions } from 'face-api.js'
import { clearFaceScanCanvas, drawFaceScanOverlays } from './drawFaceScan'
import { assessFaceVisibility } from './faceVisibility'
import { faceapi } from './loadModels'
import { detectFaceMeshFrames, getFaceLandmarker } from './mediapipeLandmarker'

export { toFaceScanDetection } from './toFaceScanDetection'

export type FaceScanState = {
  hasFace: boolean
  valid: boolean
  reason: string | null
  pointCount?: number
  faceCount: number
}

const IDLE_STATE: FaceScanState = {
  hasFace: false,
  valid: false,
  reason: null,
  pointCount: 0,
  faceCount: 0,
}

const MULTI_FACE_MSG = 'Lebih dari satu wajah terdeteksi. Pastikan hanya satu orang di kamera.'

export function useFaceScanOverlay(options: {
  videoRef: RefObject<HTMLVideoElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  enabled: boolean
  intervalMs?: number
  /** Max faces for MediaPipe overlay (1 for enroll, >1 for absensi). */
  maxFaces?: number
  /** Enroll mode: reject when face-api counts more than one face. */
  requireSingleFace?: boolean
  onDetection?: (state: FaceScanState) => void
}) {
  const {
    videoRef,
    canvasRef,
    enabled,
    intervalMs = 80,
    maxFaces = 1,
    requireSingleFace = false,
    onDetection,
  } = options
  const busyRef = useRef(false)
  const validStreakRef = useRef(0)
  const multiFaceTickRef = useRef(0)
  const onDetectionRef = useRef(onDetection)
  onDetectionRef.current = onDetection

  useEffect(() => {
    if (!enabled) {
      const canvas = canvasRef.current
      if (canvas) clearFaceScanCanvas(canvas)
      validStreakRef.current = 0
      multiFaceTickRef.current = 0
      onDetectionRef.current?.(IDLE_STATE)
      return
    }

    let cancelled = false
    let timer: number | null = null

    void (async () => {
      try {
        await getFaceLandmarker(maxFaces)
      } catch {
        if (!cancelled) {
          onDetectionRef.current?.({
            hasFace: false,
            valid: false,
            reason: 'Gagal memuat model Face Mesh MediaPipe.',
            pointCount: 0,
            faceCount: 0,
          })
        }
        return
      }

      if (cancelled) return

      timer = window.setInterval(() => {
        void (async () => {
          if (cancelled || busyRef.current) return
          const video = videoRef.current
          const canvas = canvasRef.current
          if (!video || !canvas || video.readyState < 2) return

          busyRef.current = true
          try {
            const landmarker = await getFaceLandmarker(maxFaces)
            const frames = detectFaceMeshFrames(landmarker, video)

            if (cancelled) return

            let faceCount = frames.length
            if (requireSingleFace) {
              multiFaceTickRef.current += 1
              // Throttle heavy face-api count; MediaPipe count is enough between checks.
              if (multiFaceTickRef.current % 4 === 1) {
                try {
                  const boxes = await faceapi.detectAllFaces(
                    video,
                    new TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.45 }),
                  )
                  faceCount = Array.isArray(boxes) ? boxes.length : faceCount
                } catch {
                  // keep MediaPipe count
                }
              }
            }

            if (faceCount === 0 || frames.length === 0) {
              clearFaceScanCanvas(canvas)
              validStreakRef.current = 0
              onDetectionRef.current?.(IDLE_STATE)
              return
            }

            if (requireSingleFace && faceCount > 1) {
              clearFaceScanCanvas(canvas)
              validStreakRef.current = 0
              drawFaceScanOverlays(
                canvas,
                video,
                frames.map((frame) => frame.detection),
                { valid: false, connections: frames[0]?.connections },
              )
              onDetectionRef.current?.({
                hasFace: true,
                valid: false,
                reason: MULTI_FACE_MSG,
                pointCount: frames[0]?.pointCount ?? 0,
                faceCount,
              })
              return
            }

            const primary = frames[0]
            const visibility = assessFaceVisibility(
              primary.detection,
              video.videoWidth,
              video.videoHeight,
              {
                matrix: primary.matrix,
                blendshapes: primary.blendshapes,
                video,
              },
            )

            if (visibility.valid) {
              validStreakRef.current += 1
            } else {
              validStreakRef.current = 0
            }

            const stableValid = visibility.valid && validStreakRef.current >= 2
            drawFaceScanOverlays(
              canvas,
              video,
              frames.map((frame) => frame.detection),
              {
                valid: maxFaces > 1 ? true : stableValid,
                connections: primary.connections,
              },
            )
            onDetectionRef.current?.({
              hasFace: true,
              valid: maxFaces > 1 ? true : stableValid,
              pointCount: primary.pointCount,
              faceCount,
              reason:
                maxFaces > 1
                  ? null
                  : stableValid
                    ? null
                    : visibility.reason || 'Tahan posisi wajah menghadap kamera.',
            })
          } catch {
            if (!cancelled && canvasRef.current) {
              clearFaceScanCanvas(canvasRef.current)
            }
            validStreakRef.current = 0
            onDetectionRef.current?.(IDLE_STATE)
          } finally {
            busyRef.current = false
          }
        })()
      }, intervalMs)
    })()

    return () => {
      cancelled = true
      if (timer !== null) window.clearInterval(timer)
      const canvas = canvasRef.current
      if (canvas) clearFaceScanCanvas(canvas)
    }
  }, [canvasRef, enabled, intervalMs, maxFaces, requireSingleFace, videoRef])
}
