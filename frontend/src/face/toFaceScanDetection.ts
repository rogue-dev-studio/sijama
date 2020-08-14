/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 20:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-02 20:55:00
 */
import type { FaceDetectionBox, FaceLandmarks } from 'face-api.js'
import type { FaceScanDetection } from './drawFaceScan'

type DetectionLike = {
  detection: { box: FaceDetectionBox; score?: number }
  landmarks: FaceLandmarks
}

export function toFaceScanDetection(detection: DetectionLike): FaceScanDetection {
  return {
    box: detection.detection.box,
    positions: detection.landmarks.positions.map((point) => ({ x: point.x, y: point.y })),
    score: detection.detection.score,
  }
}
