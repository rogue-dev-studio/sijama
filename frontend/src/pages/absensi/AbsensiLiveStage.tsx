/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:45:00
 */

import type { RefObject } from 'react'
import type { CameraAccessState } from '../../face/cameraAccess'
import { CameraPermissionPanel } from '../../components/CameraPermissionPanel'
import { FaceScanStage } from '../../components/FaceScanStage'
import type { NotifyState } from './types'
import { AbsensiNotify } from './AbsensiNotify'

type AbsensiLiveStageProps = {
  title: string
  displayRef: RefObject<HTMLDivElement | null>
  videoRef: RefObject<HTMLVideoElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  isFullscreen: boolean
  showCameraPermission: boolean
  cameraPermissionState: Exclude<CameraAccessState, 'checking' | 'granted'>
  cameraMessage: string | null
  cameraBusy: boolean
  cameraActive: boolean
  faceTracked: boolean
  faceValid: boolean
  notify: NotifyState
  onRequestCamera: () => void
  onToggleFullscreen: () => void
}

export function AbsensiLiveStage({
  title,
  displayRef,
  videoRef,
  canvasRef,
  isFullscreen,
  showCameraPermission,
  cameraPermissionState,
  cameraMessage,
  cameraBusy,
  cameraActive,
  faceTracked,
  faceValid,
  notify,
  onRequestCamera,
  onToggleFullscreen,
}: AbsensiLiveStageProps) {
  return (
    <div
      ref={displayRef}
      className={`absensi-display${isFullscreen ? ' absensi-display--fullscreen' : ''}`}
    >
      {isFullscreen && (
        <div className="absensi-display__fs-bar">
          <strong>{title}</strong>
          <button type="button" className="btn btn--secondary" onClick={onToggleFullscreen}>
            Keluar fullscreen
          </button>
        </div>
      )}
      <div className="camera-stage-wrap">
        {showCameraPermission && (
          <CameraPermissionPanel
            className="camera-permission--overlay"
            state={cameraPermissionState}
            message={cameraMessage}
            busy={cameraBusy}
            title="Kamera absensi"
            onRequest={onRequestCamera}
          />
        )}
        <FaceScanStage
          videoRef={videoRef}
          canvasRef={canvasRef}
          className="camera-block camera-block--kiosk"
          videoClassName="camera-video--kiosk"
          tracking={cameraActive && faceTracked}
          validity={cameraActive && faceTracked ? (faceValid ? 'valid' : 'invalid') : 'idle'}
          ariaLabel="Kamera absensi"
        />
      </div>
      <AbsensiNotify notify={notify} />
    </div>
  )
}
