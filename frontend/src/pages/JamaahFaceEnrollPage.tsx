import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TinyFaceDetectorOptions } from 'face-api.js'
import { ApiError } from '../api/client'
import { jamaahService } from '../api/services'
import type { Jamaah } from '../api/types'
import {
  CameraPermissionPanel,
  needsCameraPermissionUi,
  toCameraPermissionPanelState,
} from '../components/CameraPermissionPanel'
import { FaceScanStage } from '../components/FaceScanStage'
import { useToast } from '../components/ToastProvider'
import { useConfirm } from '../components/ConfirmDialogProvider'
import {
  type CameraAccessState,
  DEFAULT_CAMERA_CONSTRAINTS,
  describeCameraError,
  queryCameraPermission,
  requestCameraStream,
  stopMediaStream,
} from '../face/cameraAccess'
import { faceapi, loadFaceModels } from '../face/loadModels'
import { findBestMatch, toFaceProfiles, type FaceProfile } from '../face/match'
import {
  clearFaceEnrollDebug,
  faceEnrollDebug,
  flushFaceEnrollDebugNow,
  getFaceEnrollDebugFlushError,
  getFaceEnrollDebugLocal,
  setFaceEnrollDebugSnapshot,
} from '../face/enrollDebug'
import { useFaceScanOverlay, type FaceScanState } from '../face/useFaceScanOverlay'

const VALID_HOLD_MS = 700
const DESCRIPTOR_SAMPLE_MS = 180
const INVALID_GRACE_MS = 450
const SAVE_READY_PROGRESS = 0.7
const ENROLL_DUPLICATE_THRESHOLD = 0.42
const DETECTOR_OPTIONS = { inputSize: 320 as const, scoreThreshold: 0.35 }
const DETECTOR_FALLBACK = { inputSize: 416 as const, scoreThreshold: 0.25 }

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function resolveErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const detail = err.errors ? Object.values(err.errors).flat()[0] : null
    if (typeof detail === 'string' && detail.trim() !== '') {
      return detail
    }
    return err.message
  }
  if (err instanceof Error) {
    return err.message
  }
  return 'Gagal menyimpan descriptor wajah'
}

export function JamaahFaceEnrollPage() {
  const { id } = useParams()
  const jamaahId = Number(id)
  const { notifySuccess } = useToast()
  const { confirm } = useConfirm()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const capturingRef = useRef(false)
  const lockedRef = useRef(false)
  const faceValidRef = useRef(false)
  const enrolledDoneRef = useRef(false)
  const descriptorRef = useRef<Float32Array | null>(null)
  const samplingRef = useRef(false)
  const lastSampleAtRef = useRef(0)
  const invalidSinceRef = useRef<number | null>(null)
  const saveStartedRef = useRef(false)

  const [jamaah, setJamaah] = useState<Jamaah | null>(null)
  const [enrolledProfiles, setEnrolledProfiles] = useState<FaceProfile[]>([])
  const [modelsReady, setModelsReady] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraAccess, setCameraAccess] = useState<CameraAccessState>('checking')
  const [cameraMessage, setCameraMessage] = useState<string | null>(null)
  const [cameraBusy, setCameraBusy] = useState(false)
  const [faceTracked, setFaceTracked] = useState(false)
  const [faceValid, setFaceValid] = useState(false)
  const [faceHint, setFaceHint] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Menyiapkan kamera…')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [debugLines, setDebugLines] = useState<string[]>([])
  const lastDebugTickRef = useRef(0)
  const stuckLoggedRef = useRef(false)

  useEffect(() => {
    void clearFaceEnrollDebug(jamaahId)
    faceEnrollDebug('page_mount', { path: window.location.pathname }, jamaahId)
  }, [jamaahId])

  useFaceScanOverlay({
    videoRef,
    canvasRef,
    enabled: cameraReady && modelsReady && !saving && !resetting && !success && !jamaah?.face_enrolled,
    intervalMs: 90,
    maxFaces: 1,
    requireSingleFace: true,
    onDetection: (state: FaceScanState) => {
      if (lockedRef.current || capturingRef.current || saveStartedRef.current) return

      faceValidRef.current = state.valid
      setFaceTracked(state.hasFace)
      setFaceValid(state.valid)
      setFaceHint(state.reason)
      setFaceEnrollDebugSnapshot({
        faceValid: state.valid,
        faceTracked: state.hasFace,
        faceHint: state.reason,
        faceCount: state.faceCount,
        pointCount: state.pointCount ?? 0,
        hasBuffer: Boolean(descriptorRef.current),
        bufferLen: descriptorRef.current?.length ?? 0,
        progress: progressRef.current,
      })
    },
  })

  const startCamera = useCallback(async () => {
    setCameraBusy(true)
    setCameraMessage(null)
    setError(null)
    try {
      await loadFaceModels()
      setModelsReady(true)
      const stream = await requestCameraStream(DEFAULT_CAMERA_CONSTRAINTS)
      if (!videoRef.current) {
        stopMediaStream(stream)
        setCameraAccess('error')
        setCameraMessage('Pratinjau kamera belum siap. Coba lagi.')
        return null
      }
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setCameraReady(true)
      setCameraAccess('granted')
      setStatus('Hadapkan satu wajah ke kamera. Validasi otomatis akan menyimpan.')
      return stream
    } catch (err) {
      const mapped = describeCameraError(err)
      setCameraReady(false)
      setCameraAccess(mapped.state)
      setCameraMessage(mapped.message)
      setStatus(mapped.message)
      return null
    } finally {
      setCameraBusy(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    let stream: MediaStream | null = null

    async function init() {
      try {
        const [data, enrolled] = await Promise.all([
          jamaahService.get(jamaahId),
          jamaahService.list({ enrolled: true, per_page: 1000 }),
        ])
        if (!active) return

        setJamaah(data)
        setEnrolledProfiles(toFaceProfiles(enrolled.items))
        const alreadyEnrolled = Boolean(data.face_enrolled)
        enrolledDoneRef.current = alreadyEnrolled
        lockedRef.current = alreadyEnrolled

        if (alreadyEnrolled) {
          setSuccess('Wajah sudah terdaftar.')
          notifySuccess('Wajah sudah terdaftar.')
          setStatus('Wajah sudah terdaftar untuk jamaah ini.')
          setProgress(0)
          progressRef.current = 0
          setCameraAccess('granted')
          return
        }

        const permission = await queryCameraPermission()
        if (!active) return

        if (permission === 'granted') {
          setCameraAccess('checking')
          stream = await startCamera()
          return
        }

        setCameraAccess(permission === 'prompt' ? 'prompt' : permission)
        setStatus('Izin kamera diperlukan untuk mendaftarkan wajah.')
      } catch (err) {
        if (active) {
          setError(resolveErrorMessage(err))
        }
      }
    }

    void init()

    return () => {
      active = false
      const current = videoRef.current?.srcObject
      if (current instanceof MediaStream) {
        stopMediaStream(current)
      }
      stopMediaStream(stream)
    }
  }, [jamaahId, startCamera])

  const sampleDescriptor = useCallback(async (force = false) => {
    const video = videoRef.current
    if (!video || !modelsReady) {
      faceEnrollDebug('sample_skip', { reason: !video ? 'no_video' : 'models_not_ready', force }, jamaahId)
      return
    }
    if (!force && !faceValidRef.current && !lockedRef.current) {
      return
    }

    if (force) {
      for (let wait = 0; wait < 25 && samplingRef.current; wait += 1) {
        await sleep(40)
      }
    } else if (samplingRef.current) {
      return
    }

    const now = performance.now()
    if (!force && now - lastSampleAtRef.current < DESCRIPTOR_SAMPLE_MS && descriptorRef.current) {
      return
    }

    // Capture permission to store BEFORE slow detect (avoids flicker race).
    const allowStore = force || lockedRef.current || saveStartedRef.current || faceValidRef.current

    samplingRef.current = true
    lastSampleAtRef.current = now
    faceEnrollDebug('sample_start', { force, allowStore, faceValid: faceValidRef.current }, jamaahId)
    try {
      let detections = await faceapi
        .detectAllFaces(video, new TinyFaceDetectorOptions(DETECTOR_OPTIONS))
        .withFaceLandmarks()
        .withFaceDescriptors()

      if (!detections || detections.length === 0) {
        detections = await faceapi
          .detectAllFaces(video, new TinyFaceDetectorOptions(DETECTOR_FALLBACK))
          .withFaceLandmarks()
          .withFaceDescriptors()
        faceEnrollDebug(
          'sample_fallback',
          { force, count: Array.isArray(detections) ? detections.length : 0 },
          jamaahId,
        )
      }

      if (!detections || detections.length === 0) {
        faceEnrollDebug('sample_empty', { force, allowStore }, jamaahId)
        return
      }

      if (detections.length > 1) {
        // Prefer the largest face instead of aborting enroll buffer.
        detections = [...detections].sort(
          (a, b) =>
            (b.detection.box.width * b.detection.box.height) -
            (a.detection.box.width * a.detection.box.height),
        )
        faceEnrollDebug('sample_multi_pick_largest', { force, count: detections.length }, jamaahId)
      }

      const detection = detections[0]
      if (detection && allowStore) {
        descriptorRef.current = detection.descriptor
        stuckLoggedRef.current = false
        faceEnrollDebug(
          'sample_ok',
          { force, bufferLen: detection.descriptor.length, allowStore: true },
          jamaahId,
        )
      } else {
        faceEnrollDebug(
          'sample_not_stored',
          {
            force,
            allowStore,
            faceValid: faceValidRef.current,
            locked: lockedRef.current,
            saveStarted: saveStartedRef.current,
          },
          jamaahId,
        )
      }
    } catch (err) {
      faceEnrollDebug(
        'sample_error',
        { force, message: err instanceof Error ? err.message : 'unknown' },
        jamaahId,
      )
    } finally {
      samplingRef.current = false
    }
  }, [jamaahId, modelsReady])

  const unlockForRetry = useCallback((message: string) => {
    faceEnrollDebug('unlock_retry', { message, hasBuffer: Boolean(descriptorRef.current) }, jamaahId)
    lockedRef.current = false
    capturingRef.current = false
    saveStartedRef.current = false
    invalidSinceRef.current = null
    stuckLoggedRef.current = false
    progressRef.current = 0
    setProgress(0)
    setSaving(false)
    setStatus(message)
  }, [jamaahId])

  const saveBufferedFace = useCallback(
    async (readyDescriptor?: Float32Array | null) => {
      if (enrolledDoneRef.current || saveStartedRef.current) {
        faceEnrollDebug(
          'save_skip',
          { enrolledDone: enrolledDoneRef.current, saveStarted: saveStartedRef.current },
          jamaahId,
        )
        return
      }

      const buffered = readyDescriptor ?? descriptorRef.current
      if (!buffered || buffered.length < 64) {
        faceEnrollDebug(
          'save_abort_no_buffer',
          { bufferLen: buffered?.length ?? 0, progress: progressRef.current },
          jamaahId,
        )
        return
      }

      const descriptor = buffered
      descriptorRef.current = descriptor
      const payload = Array.from(descriptor)

      saveStartedRef.current = true
      lockedRef.current = true
      capturingRef.current = true
      setFaceTracked(true)
      setFaceValid(true)
      setFaceHint(null)
      setSaving(true)
      setError(null)
      setSuccess(null)
      setStatus('Menyimpan wajah…')
      setProgress(1)
      progressRef.current = 1
      faceEnrollDebug('save_start', { bufferLen: descriptor.length, payloadLen: payload.length }, jamaahId)

      try {
        const duplicate = findBestMatch(descriptor, enrolledProfiles, {
          excludeId: jamaahId,
          threshold: ENROLL_DUPLICATE_THRESHOLD,
        })
        if (duplicate) {
          const message = `Wajah ini sudah terdaftar atas nama ${duplicate.profile.nama}. Tidak dapat didaftarkan ke jamaah lain.`
          faceEnrollDebug(
            'save_duplicate',
            { otherId: duplicate.profile.id, distance: duplicate.distance },
            jamaahId,
          )
          setError(message)
          unlockForRetry('Wajah sudah dipakai jamaah lain.')
          return
        }

        const apiStarted = performance.now()
        await jamaahService.enrollFace(jamaahId, payload)
        faceEnrollDebug('save_api_ok', { ms: Math.round(performance.now() - apiStarted) }, jamaahId)
        enrolledDoneRef.current = true
        setJamaah((prev) => (prev ? { ...prev, face_enrolled: true } : prev))
        setEnrolledProfiles((prev) => {
          const next = prev.filter((item) => item.id !== jamaahId)
          next.push({
            id: jamaahId,
            nama: jamaah?.nama || `Jamaah #${jamaahId}`,
            descriptor,
          })
          return next
        })
        setSuccess('Wajah berhasil didaftarkan.')
        notifySuccess('Wajah berhasil didaftarkan.')
        setStatus('Pendaftaran wajah selesai.')
        lockedRef.current = true
        setProgress(1)
        progressRef.current = 1
      } catch (err) {
        const message = resolveErrorMessage(err)
        faceEnrollDebug('save_api_error', { message }, jamaahId)
        setError(message)
        unlockForRetry('Gagal mendaftarkan wajah. Validasi diulang.')
      } finally {
        setSaving(false)
        capturingRef.current = false
        if (!enrolledDoneRef.current) {
          saveStartedRef.current = false
        }
      }
    },
    [enrolledProfiles, jamaah?.nama, jamaahId, unlockForRetry],
  )

  useEffect(() => {
    if (
      !cameraReady ||
      !modelsReady ||
      saving ||
      resetting ||
      success ||
      enrolledDoneRef.current ||
      lockedRef.current ||
      saveStartedRef.current
    ) {
      return
    }

    let raf = 0
    let last = performance.now()
    let alive = true

    const tick = (now: number) => {
      if (!alive || lockedRef.current || capturingRef.current || saveStartedRef.current) return

      const dt = Math.min(64, now - last)
      last = now

      if (faceValid && faceTracked) {
        invalidSinceRef.current = null
        const next = Math.min(1, progressRef.current + dt / VALID_HOLD_MS)
        progressRef.current = next

        const hasBuffer = Boolean(descriptorRef.current)
        setProgress(next)
        setStatus((prev) => {
          if (prev.startsWith('Menyimpan')) return prev
          if (!hasBuffer && next >= SAVE_READY_PROGRESS) {
            return 'Mengambil data wajah… tahan posisi.'
          }
          if (prev.startsWith('Memvalidasi') || prev.startsWith('Mengambil')) return prev
          return 'Memvalidasi wajah… tahan posisi.'
        })

        if (now - lastDebugTickRef.current > 700) {
          lastDebugTickRef.current = now
          const snap = {
            rawProgress: Number(next.toFixed(3)),
            hasBuffer,
            bufferLen: descriptorRef.current?.length ?? 0,
            faceValid,
            faceTracked,
            faceHint,
            sampling: samplingRef.current,
            saveReadyAt: SAVE_READY_PROGRESS,
            waitingBuffer: !hasBuffer && next >= SAVE_READY_PROGRESS,
            flushError: getFaceEnrollDebugFlushError(),
          }
          setFaceEnrollDebugSnapshot(snap)
          faceEnrollDebug('tick', snap, jamaahId)
          setDebugLines(
            getFaceEnrollDebugLocal()
              .slice(-12)
              .map((item) => `${item.t.slice(11, 19)} ${item.event} ${JSON.stringify(item.data ?? {})}`),
          )
          if (!hasBuffer && next >= 0.9 && !stuckLoggedRef.current) {
            stuckLoggedRef.current = true
            faceEnrollDebug('stuck_waiting_buffer', snap, jamaahId)
            void flushFaceEnrollDebugNow()
          }
        }

        if (next >= 0.05) {
          void sampleDescriptor(next >= SAVE_READY_PROGRESS)
        }

        if (next >= SAVE_READY_PROGRESS && descriptorRef.current) {
          faceEnrollDebug(
            'save_trigger',
            { rawProgress: next, bufferLen: descriptorRef.current.length },
            jamaahId,
          )
          void flushFaceEnrollDebugNow()
          void saveBufferedFace(descriptorRef.current)
          return
        }
      } else if (progressRef.current > 0) {
        if (invalidSinceRef.current === null) {
          invalidSinceRef.current = now
        }
        if (now - invalidSinceRef.current > INVALID_GRACE_MS) {
          progressRef.current = 0
          setProgress(0)
          invalidSinceRef.current = null
          if (faceTracked && !faceValid) {
            setStatus(faceHint || 'Wajah belum valid. Validasi diulang.')
          } else if (!faceTracked) {
            setStatus('Hadapkan satu wajah ke kamera. Validasi otomatis akan menyimpan.')
          }
        }
      }

      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => {
      alive = false
      window.cancelAnimationFrame(raf)
    }
  }, [
    cameraReady,
    faceHint,
    faceTracked,
    faceValid,
    modelsReady,
    resetting,
    sampleDescriptor,
    saveBufferedFace,
    saving,
    success,
    jamaahId,
  ])

  async function handleResetFace() {
    if (!jamaah?.face_enrolled) return
    const confirmed = await confirm({
      title: 'Reset data wajah',
      message: `Reset data wajah untuk ${jamaah.nama}? Jamaah ini tidak bisa absen lewat kamera sampai didaftarkan ulang.`,
      confirmLabel: 'Ya, reset',
    })
    if (!confirmed) return

    setResetting(true)
    setError(null)
    setSuccess(null)
    setStatus('Menghapus data wajah…')
    lockedRef.current = false
    capturingRef.current = false
    progressRef.current = 0
    setProgress(0)
    descriptorRef.current = null
    enrolledDoneRef.current = false

    try {
      await jamaahService.resetFace(jamaahId)
      setJamaah((prev) => (prev ? { ...prev, face_enrolled: false, face_descriptor: undefined } : prev))
      setEnrolledProfiles((prev) => prev.filter((item) => item.id !== jamaahId))
      setSuccess(null)

      if (!cameraReady) {
        await startCamera()
      }
      setStatus('Wajah dihapus. Hadapkan satu wajah ke kamera untuk daftar ulang.')
    } catch (err) {
      setError(resolveErrorMessage(err))
      setStatus('Gagal mereset wajah.')
    } finally {
      setResetting(false)
    }
  }

  const busy = saving || resetting || cameraBusy
  const alreadyRegistered = Boolean(jamaah?.face_enrolled) || Boolean(success)
  const showCameraPermission =
    !alreadyRegistered && needsCameraPermissionUi(cameraAccess) && !cameraReady
  const showValid = faceValid || lockedRef.current || saving || alreadyRegistered
  const validity: 'idle' | 'invalid' | 'valid' =
    showValid ? 'valid' : faceTracked ? 'invalid' : 'idle'
  const isComplete = alreadyRegistered && !saving && !resetting

  return (
    <div className="face-page">
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Pendaftaran wajah</h1>
            <p>{jamaah ? jamaah.nama : 'Memuat…'}</p>
          </div>
          <Link to="/jamaah" className="btn btn--secondary">
            Kembali
          </Link>
        </div>
      </header>

      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert--success" role="status">
          {success}
        </div>
      )}

      {showCameraPermission ? (
        <div className="camera-stage-wrap">
          <CameraPermissionPanel
            className="camera-permission--overlay"
            state={toCameraPermissionPanelState(cameraAccess)}
            message={cameraMessage}
            busy={cameraBusy}
            onRequest={() => {
              void startCamera()
            }}
          />
          <FaceScanStage
            videoRef={videoRef}
            canvasRef={canvasRef}
            className="camera-block camera-block--full"
            tracking={false}
            validity="idle"
            progress={0}
            complete={false}
            ariaLabel="Pratinjau kamera"
            footer={
              <div className="camera-status">
                <div className="camera-status__detail">{status}</div>
              </div>
            }
          />
        </div>
      ) : cameraReady || !jamaah?.face_enrolled ? (
        <FaceScanStage
          videoRef={videoRef}
          canvasRef={canvasRef}
          className="camera-block camera-block--full"
          tracking={isComplete ? false : faceTracked || showValid}
          validity={isComplete ? 'valid' : validity}
          progress={isComplete || saving ? 1 : progress}
          complete={isComplete}
          guideLabel={
            isComplete
              ? success === 'Wajah sudah terdaftar.'
                ? 'Wajah sudah terdaftar'
                : 'Pendaftaran selesai'
              : null
          }
          ariaLabel="Pratinjau kamera"
          footer={
            <div className="camera-status">
              <div className="camera-status__detail">{status}</div>
              {!isComplete && faceTracked && !showValid && faceHint && (
                <div className="camera-status__hint camera-status__hint--warn">{faceHint}</div>
              )}
              {!isComplete && showValid && !saving && progress > 0 && progress < 1 && (
                <div className="camera-status__hint camera-status__hint--ok">
                  Memvalidasi… {Math.round(progress * 100)}%
                </div>
              )}
              {saving && !success && (
                <div className="camera-status__hint camera-status__hint--ok">Sedang menyimpan…</div>
              )}
              {isComplete && (
                <div className="camera-status__hint camera-status__hint--ok">Pendaftaran selesai</div>
              )}
            </div>
          }
        />
      ) : (
        <div className="camera-status camera-block camera-block--full">
          <div className="camera-status__detail">{status}</div>
        </div>
      )}

      <div className="btn-group">
        {jamaah?.face_enrolled && (
          <>
            <button
              type="button"
              className="btn btn--danger"
              disabled={busy}
              onClick={() => void handleResetFace()}
            >
              {resetting ? 'Mereset…' : 'Reset wajah'}
            </button>
            <span className="badge badge--ok">Sudah terdaftar</span>
          </>
        )}
        {!jamaah?.face_enrolled && !success && (
          <span className="camera-status__hint">Simpan otomatis setelah validasi selesai.</span>
        )}
      </div>

      <aside className="face-enroll-debug" aria-label="Debug enroll wajah">
        <strong>Debug enroll (sementara)</strong>
        <div className="face-enroll-debug__meta">
          progress={Math.round(progress * 100)}% · valid={String(faceValid)} · tracked={String(faceTracked)} ·
          buffer={descriptorRef.current?.length ?? 0} · hint={faceHint || '—'}
          {getFaceEnrollDebugFlushError() ? ` · flushError=${getFaceEnrollDebugFlushError()}` : ''}
        </div>
        <pre className="face-enroll-debug__log">{debugLines.join('\n') || 'Menunggu event…'}</pre>
        <div className="btn-group">
          <button
            type="button"
            className="btn btn--secondary btn--small"
            onClick={() => {
              void flushFaceEnrollDebugNow().then(() => {
                setDebugLines(
                  getFaceEnrollDebugLocal()
                    .slice(-12)
                    .map((item) => `${item.t.slice(11, 19)} ${item.event} ${JSON.stringify(item.data ?? {})}`),
                )
              })
            }}
          >
            Kirim log sekarang
          </button>
        </div>
        <p className="muted">Setelah mentok, klik “Kirim log sekarang” lalu kabari agent.</p>
      </aside>
    </div>
  )
}
