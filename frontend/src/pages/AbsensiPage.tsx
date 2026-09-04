import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TinyFaceDetectorOptions } from 'face-api.js'
import { ApiError } from '../api/client'
import { attendanceService, jamaahService, kegiatanService } from '../api/services'
import type { AttendanceSession, Jamaah, Kegiatan } from '../api/types'
import {
  needsCameraPermissionUi,
  toCameraPermissionPanelState,
} from '../components/CameraPermissionPanel'
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
import { useFaceScanOverlay, type FaceScanState } from '../face/useFaceScanOverlay'
import { useAuth } from '../auth/AuthContext'
import { AbsensiControls } from './absensi/AbsensiControls'
import { AbsensiLiveBar } from './absensi/AbsensiLiveBar'
import { AbsensiLiveStage } from './absensi/AbsensiLiveStage'
import { AbsensiNotify } from './absensi/AbsensiNotify'
import { FormPageLoading } from '../components/FormPageLoading'
import type { NotifyState, RefOption } from './absensi/types'

const CHECK_IN_DEBOUNCE_MS = 4000
const NOTIFY_CLEAR_MS = 4500

export function AbsensiPage() {
  const { can } = useAuth()
  const canManageSession = can('absensi.create')
  const canCheckIn = can('absensi.execute')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const displayRef = useRef<HTMLDivElement>(null)
  const scanTimerRef = useRef<number | null>(null)
  const lastCheckInRef = useRef<Map<number, number>>(new Map())
  const scanningRef = useRef(false)
  const notifyTimerRef = useRef<number | null>(null)

  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [kegiatanOptions, setKegiatanOptions] = useState<RefOption[]>([])
  const [jamaahOptions, setJamaahOptions] = useState<Jamaah[]>([])
  const [faceProfiles, setFaceProfiles] = useState<FaceProfile[]>([])
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null)
  const [attendedIds, setAttendedIds] = useState<Set<number>>(new Set())

  const [refId, setRefId] = useState('')
  const [manualJamaahId, setManualJamaahId] = useState('')
  const [showSetup, setShowSetup] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [faceTracked, setFaceTracked] = useState(false)
  const [faceValid, setFaceValid] = useState(false)
  const faceValidRef = useRef(false)

  const [cameraActive, setCameraActive] = useState(false)
  const [cameraAccess, setCameraAccess] = useState<CameraAccessState>('checking')
  const [cameraMessage, setCameraMessage] = useState<string | null>(null)
  const [cameraBusy, setCameraBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notify, setNotify] = useState<NotifyState>({
    kind: 'idle',
    title: 'Siapkan sesi',
    detail: 'Pilih atau buka sesi absensi untuk menampilkan layar pemindaian.',
  })

  const refOptions = kegiatanOptions
  const isDisplayMode = activeSession?.status === 'open'

  useFaceScanOverlay({
    videoRef,
    canvasRef,
    enabled: cameraActive && isDisplayMode,
    intervalMs: 200,
    maxFaces: 5,
    requireSingleFace: false,
    onDetection: (state: FaceScanState) => {
      setFaceTracked(state.hasFace)
      setFaceValid(state.valid)
      faceValidRef.current = state.valid
    },
  })

  const loadSessions = useCallback(async () => {
    const result = await attendanceService.listSessions({ status: 'open', per_page: 100 })
    setSessions(result.items)
    return result.items
  }, [])

  const loadReferenceData = useCallback(async () => {
    const [kegiatan, jamaahList, enrolled] = await Promise.all([
      kegiatanService.list({ per_page: 100 }),
      jamaahService.list({ per_page: 100 }),
      jamaahService.list({ enrolled: true, per_page: 100 }),
    ])

    setKegiatanOptions(
      kegiatan.items.map((item: Kegiatan) => {
        const dateLabel = new Date(item.tanggal).toLocaleDateString('id-ID')
        const timeLabel = [item.jam_mulai, item.jam_selesai].filter(Boolean).join('–')
        const suffix = timeLabel ? `${dateLabel} ${timeLabel}` : dateLabel
        return {
          id: item.id,
          label: `${item.judul} · ${suffix}`,
        }
      }),
    )
    setJamaahOptions(jamaahList.items)

    const enrolledItems = enrolled.items.filter(
      (item) => item.face_enrolled || (item.face_descriptor && item.face_descriptor.length > 0),
    )
    setFaceProfiles(toFaceProfiles(enrolledItems))
  }, [])

  const pushNotify = useCallback((next: NotifyState) => {
    setNotify(next)
    if (notifyTimerRef.current) {
      window.clearTimeout(notifyTimerRef.current)
      notifyTimerRef.current = null
    }
    if (next.kind === 'success' || next.kind === 'already' || next.kind === 'unknown') {
      notifyTimerRef.current = window.setTimeout(() => {
        setNotify({
          kind: 'idle',
          title: 'Siap memindai',
          detail: 'Arahkan satu atau lebih wajah ke kamera.',
        })
      }, NOTIFY_CLEAR_MS)
    }
  }, [])

  const refreshSession = useCallback(async (sessionId: number) => {
    const session = await attendanceService.getSession(sessionId)
    setActiveSession(session)
    const ids = new Set((session.attendances || []).map((item) => item.jamaah_id))
    setAttendedIds(ids)
    setShowSetup(false)
    return session
  }, [])

  useEffect(() => {
    let active = true

    async function init() {
      try {
        await loadReferenceData()
        const openSessions = await loadSessions()
        if (!active) return

        const current = openSessions[0]
        if (current) {
          await refreshSession(current.id)
          pushNotify({
            kind: 'idle',
            title: 'Siap memindai',
            detail: `Sesi: ${current.title}`,
          })
        }
      } catch (err) {
        if (active) {
          pushNotify({
            kind: 'error',
            title: 'Gagal memuat',
            detail: err instanceof ApiError ? err.message : 'Gagal memuat data absensi',
          })
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void init()
    return () => {
      active = false
      if (notifyTimerRef.current) window.clearTimeout(notifyTimerRef.current)
    }
  }, [loadReferenceData, loadSessions, pushNotify, refreshSession])

  const stopCamera = useCallback(() => {
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current)
      scanTimerRef.current = null
    }
    scanningRef.current = false

    const video = videoRef.current
    const stream = video?.srcObject
    if (stream instanceof MediaStream) {
      stopMediaStream(stream)
    }
    if (video) {
      video.srcObject = null
    }
    setCameraActive(false)
  }, [])

  const performCheckIn = useCallback(
    async (
      jamaahId: number,
      method: 'face' | 'manual',
      matchedDistance?: number,
      nama?: string,
      options?: { silent?: boolean },
    ): Promise<'success' | 'already' | 'error' | 'skipped'> => {
      if (!activeSession || activeSession.status !== 'open') return 'skipped'

      const displayName =
        nama || jamaahOptions.find((item) => item.id === jamaahId)?.nama || 'Jamaah'

      if (attendedIds.has(jamaahId)) {
        if (!options?.silent) {
          pushNotify({
            kind: 'already',
            title: 'Sudah absen',
            detail: `${displayName} sudah tercatat pada sesi ini.`,
          })
        }
        return 'already'
      }

      const now = Date.now()
      const last = lastCheckInRef.current.get(jamaahId) || 0
      if (now - last < CHECK_IN_DEBOUNCE_MS) return 'skipped'

      lastCheckInRef.current.set(jamaahId, now)

      try {
        await attendanceService.checkIn(activeSession.id, {
          jamaah_id: jamaahId,
          method,
          matched_distance: matchedDistance,
        })
        setAttendedIds((prev) => {
          const next = new Set(prev)
          next.add(jamaahId)
          return next
        })
        if (!options?.silent) {
          pushNotify({
            kind: 'success',
            title: 'Berhasil absen',
            detail: `${displayName} tercatat hadir.`,
          })
        }
        return 'success'
      } catch (err) {
        lastCheckInRef.current.delete(jamaahId)
        const message = err instanceof ApiError ? err.message : 'Check-in gagal'
        if (/sudah tercatat|sudah absen|already/i.test(message)) {
          setAttendedIds((prev) => {
            const next = new Set(prev)
            next.add(jamaahId)
            return next
          })
          if (!options?.silent) {
            pushNotify({
              kind: 'already',
              title: 'Sudah absen',
              detail: `${displayName} sudah tercatat pada sesi ini.`,
            })
          }
          return 'already'
        }
        if (!options?.silent) {
          pushNotify({
            kind: 'error',
            title: 'Gagal absen',
            detail: message,
          })
        }
        return 'error'
      }
    },
    [activeSession, attendedIds, jamaahOptions, pushNotify],
  )

  const scanFrame = useCallback(async () => {
    if (scanningRef.current || !activeSession || activeSession.status !== 'open') return

    const video = videoRef.current
    if (!video || video.readyState < 2 || faceProfiles.length === 0) return

    scanningRef.current = true
    try {
      const detections = await faceapi
        .detectAllFaces(video, new TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptors()

      if (!detections || detections.length === 0) {
        return
      }

      const matchedIds = new Set<number>()
      const successNames: string[] = []
      const alreadyNames: string[] = []
      let unknownCount = 0

      for (const detection of detections) {
        const match = findBestMatch(detection.descriptor, faceProfiles)
        if (!match) {
          unknownCount += 1
          continue
        }
        if (matchedIds.has(match.profile.id)) continue
        matchedIds.add(match.profile.id)

        const result = await performCheckIn(
          match.profile.id,
          'face',
          match.distance,
          match.profile.nama,
          { silent: true },
        )
        if (result === 'success') successNames.push(match.profile.nama)
        if (result === 'already') alreadyNames.push(match.profile.nama)
      }

      if (successNames.length > 0) {
        pushNotify({
          kind: 'success',
          title:
            successNames.length === 1
              ? 'Berhasil absen'
              : `${successNames.length} wajah berhasil absen`,
          detail: successNames.join(', '),
        })
      } else if (alreadyNames.length > 0 && unknownCount === 0) {
        pushNotify({
          kind: 'already',
          title: 'Sudah absen',
          detail: alreadyNames.join(', '),
        })
      } else if (unknownCount > 0 && successNames.length === 0 && alreadyNames.length === 0) {
        pushNotify({
          kind: 'unknown',
          title: 'Belum dikenali',
          detail:
            unknownCount === 1
              ? 'Wajah tidak cocok dengan data jamaah terdaftar.'
              : `${unknownCount} wajah tidak dikenali.`,
        })
      } else if (unknownCount > 0 && alreadyNames.length > 0) {
        pushNotify({
          kind: 'already',
          title: 'Sebagian sudah absen',
          detail: `${alreadyNames.join(', ')}${unknownCount ? ` · ${unknownCount} belum dikenali` : ''}`,
        })
      }
    } catch {
      pushNotify({
        kind: 'error',
        title: 'Scan gagal',
        detail: 'Pemindaian wajah gagal, coba lagi.',
      })
    } finally {
      scanningRef.current = false
    }
  }, [activeSession, faceProfiles, performCheckIn, pushNotify])

  const startCamera = useCallback(async () => {
    if (!activeSession || activeSession.status !== 'open') return false

    if (faceProfiles.length === 0) {
      pushNotify({
        kind: 'error',
        title: 'Belum siap',
        detail: 'Belum ada jamaah dengan descriptor wajah.',
      })
      return false
    }

    setCameraBusy(true)
    setCameraMessage(null)
    stopCamera()

    try {
      await loadFaceModels()
      const stream = await requestCameraStream(DEFAULT_CAMERA_CONSTRAINTS)

      const video = videoRef.current
      if (!video) {
        stopMediaStream(stream)
        setCameraAccess('error')
        setCameraMessage('Pratinjau kamera belum siap. Coba lagi.')
        return false
      }

      video.srcObject = stream
      await video.play()
      setCameraActive(true)
      setCameraAccess('granted')
      pushNotify({
        kind: 'idle',
        title: 'Siap memindai',
        detail: 'Arahkan satu atau lebih wajah ke kamera.',
      })

      scanTimerRef.current = window.setInterval(() => {
        void scanFrame()
      }, 500)
      return true
    } catch (err) {
      const mapped = describeCameraError(err)
      setCameraActive(false)
      setCameraAccess(mapped.state)
      setCameraMessage(mapped.message)
      pushNotify({
        kind: 'error',
        title: 'Kamera gagal',
        detail: mapped.message,
      })
      return false
    } finally {
      setCameraBusy(false)
    }
  }, [activeSession, faceProfiles.length, pushNotify, scanFrame, stopCamera])

  useEffect(() => {
    let cancelled = false

    async function prepareCamera() {
      if (!(activeSession?.status === 'open' && faceProfiles.length > 0)) {
        stopCamera()
        setCameraAccess('checking')
        setCameraMessage(null)
        return
      }

      const permission = await queryCameraPermission()
      if (cancelled) return

      if (permission === 'granted') {
        setCameraAccess('checking')
        await startCamera()
        return
      }

      stopCamera()
      setCameraAccess(permission === 'prompt' ? 'prompt' : permission)
      setCameraMessage(null)
      pushNotify({
        kind: 'error',
        title: 'Izin kamera',
        detail: 'Izinkan kamera untuk memulai pemindaian absensi.',
      })
    }

    void prepareCamera()

    return () => {
      cancelled = true
      stopCamera()
    }
  }, [activeSession?.id, activeSession?.status, faceProfiles.length, pushNotify, startCamera, stopCamera])

  async function handleOpenSession() {
    if (!refId) {
      pushNotify({
        kind: 'error',
        title: 'Referensi kosong',
        detail: 'Pilih kegiatan terlebih dahulu.',
      })
      return
    }

    const selected = refOptions.find((item) => item.id === Number(refId))
    if (!selected) return

    setBusy(true)
    try {
      const session = await attendanceService.openSession({
        type: 'kegiatan',
        ref_id: Number(refId),
        title: selected.label.split(' · ')[0] || selected.label,
      })
      await loadSessions()
      setActiveSession(session)
      setAttendedIds(new Set())
      setShowSetup(false)
      pushNotify({
        kind: 'idle',
        title: 'Sesi dibuka',
        detail: session.title,
      })
    } catch (err) {
      pushNotify({
        kind: 'error',
        title: 'Gagal membuka sesi',
        detail: err instanceof ApiError ? err.message : 'Gagal membuka sesi',
      })
    } finally {
      setBusy(false)
    }
  }

  async function handleSelectSession(sessionId: string) {
    if (!sessionId) {
      setActiveSession(null)
      setAttendedIds(new Set())
      stopCamera()
      setShowSetup(true)
      pushNotify({
        kind: 'idle',
        title: 'Siapkan sesi',
        detail: 'Pilih atau buka sesi absensi.',
      })
      return
    }

    setBusy(true)
    try {
      const session = await refreshSession(Number(sessionId))
      pushNotify({
        kind: 'idle',
        title: 'Siap memindai',
        detail: `Sesi: ${session.title}`,
      })
    } catch (err) {
      pushNotify({
        kind: 'error',
        title: 'Gagal memuat sesi',
        detail: err instanceof ApiError ? err.message : 'Gagal memuat sesi',
      })
    } finally {
      setBusy(false)
    }
  }

  async function handleCloseSession() {
    if (!activeSession) return
    setBusy(true)
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => undefined)
      }
      await attendanceService.closeSession(activeSession.id)
      stopCamera()
      await loadSessions()
      setActiveSession(null)
      setAttendedIds(new Set())
      setShowSetup(true)
      pushNotify({
        kind: 'idle',
        title: 'Sesi ditutup',
        detail: 'Layar absensi siap untuk sesi berikutnya.',
      })
    } catch (err) {
      pushNotify({
        kind: 'error',
        title: 'Gagal menutup sesi',
        detail: err instanceof ApiError ? err.message : 'Gagal menutup sesi',
      })
    } finally {
      setBusy(false)
    }
  }

  async function handleManualCheckIn() {
    if (!manualJamaahId) {
      pushNotify({
        kind: 'error',
        title: 'Jamaah belum dipilih',
        detail: 'Pilih jamaah untuk absensi manual.',
      })
      return
    }
    const jamaah = jamaahOptions.find((item) => item.id === Number(manualJamaahId))
    setBusy(true)
    try {
      await performCheckIn(Number(manualJamaahId), 'manual', undefined, jamaah?.nama)
    } finally {
      setBusy(false)
    }
  }

  const syncFullscreenState = useCallback(() => {
    const node = displayRef.current
    const doc = document as Document & {
      webkitFullscreenElement?: Element | null
    }
    const active = document.fullscreenElement === node || doc.webkitFullscreenElement === node
    setIsFullscreen(Boolean(active))
  }, [])

  const toggleFullscreen = useCallback(async () => {
    const node = displayRef.current
    if (!node) return

    const el = node as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void
    }
    const doc = document as Document & {
      webkitFullscreenElement?: Element | null
      webkitExitFullscreen?: () => Promise<void> | void
    }

    try {
      if (document.fullscreenElement === node || doc.webkitFullscreenElement === node) {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else {
          await doc.webkitExitFullscreen?.()
        }
        return
      }

      if (el.requestFullscreen) {
        await el.requestFullscreen()
      } else {
        await el.webkitRequestFullscreen?.()
      }
    } catch (err) {
      pushNotify({
        kind: 'error',
        title: 'Fullscreen gagal',
        detail: err instanceof Error ? err.message : 'Browser menolak mode fullscreen.',
      })
    }
  }, [pushNotify])

  useEffect(() => {
    document.addEventListener('fullscreenchange', syncFullscreenState)
    document.addEventListener('webkitfullscreenchange', syncFullscreenState)
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState)
      document.removeEventListener('webkitfullscreenchange', syncFullscreenState)
    }
  }, [syncFullscreenState])

  const attendedCount = useMemo(() => attendedIds.size, [attendedIds])
  const showCameraPermission =
    isDisplayMode && faceProfiles.length > 0 && !cameraActive && needsCameraPermissionUi(cameraAccess)

  if (loading) {
    return (
      <FormPageLoading
        title="Layar Absensi"
        description="Mode tampilan kamera. Tanpa daftar hadir — hanya notifikasi sudah atau belum absen."
        message="Memuat layar absensi…"
      />
    )
  }

  return (
    <div className={`absensi-screen${isDisplayMode ? ' absensi-screen--live' : ''}`}>
      {!isDisplayMode && (
        <header className="page-header">
          <h1>Layar Absensi</h1>
          <p>Mode tampilan kamera. Tanpa daftar hadir — hanya notifikasi sudah atau belum absen.</p>
        </header>
      )}

      {isDisplayMode && activeSession && (
        <AbsensiLiveBar
          session={activeSession}
          cameraActive={cameraActive}
          attendedCount={attendedCount}
          showSetup={showSetup}
          busy={busy}
          canManageSession={canManageSession}
          isFullscreen={isFullscreen}
          onToggleSetup={() => setShowSetup((value) => !value)}
          onToggleFullscreen={() => void toggleFullscreen()}
          onCloseSession={() => void handleCloseSession()}
        />
      )}

      {(showSetup || !isDisplayMode) && (
        <AbsensiControls
          sessions={sessions}
          activeSession={activeSession}
          jamaahOptions={jamaahOptions}
          refOptions={refOptions}
          refId={refId}
          manualJamaahId={manualJamaahId}
          busy={busy}
          canCheckIn={canCheckIn}
          canManageSession={canManageSession}
          onSelectSession={(next) => void handleSelectSession(next)}
          onManualJamaahChange={setManualJamaahId}
          onManualCheckIn={() => void handleManualCheckIn()}
          onRefIdChange={setRefId}
          onOpenSession={() => void handleOpenSession()}
        />
      )}

      {isDisplayMode && canCheckIn && activeSession && (
        <AbsensiLiveStage
          title={activeSession.title}
          displayRef={displayRef}
          videoRef={videoRef}
          canvasRef={canvasRef}
          isFullscreen={isFullscreen}
          showCameraPermission={showCameraPermission}
          cameraPermissionState={toCameraPermissionPanelState(cameraAccess)}
          cameraMessage={cameraMessage}
          cameraBusy={cameraBusy}
          cameraActive={cameraActive}
          faceTracked={faceTracked}
          faceValid={faceValid}
          notify={notify}
          onRequestCamera={() => {
            void startCamera()
          }}
          onToggleFullscreen={() => void toggleFullscreen()}
        />
      )}

      {!isDisplayMode && <AbsensiNotify notify={notify} />}
    </div>
  )
}
