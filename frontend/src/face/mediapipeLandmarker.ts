/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 21:32:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 18:00:00
 */
import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision'
import type { FaceScanDetection, Point2 } from './drawFaceScan'

const WASM_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

const landmarkerByFaces = new Map<number, Promise<FaceLandmarker>>()
let lastTimestamp = 0

export type MediaPipeFaceFrame = {
  detection: FaceScanDetection
  matrix: number[] | null
  connections: Array<{ start: number; end: number }>
  pointCount: number
  blendshapes: Record<string, number>
}

async function createLandmarker(delegate: 'GPU' | 'CPU', numFaces: number) {
  const vision = await FilesetResolver.forVisionTasks(WASM_ROOT)
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_URL,
      delegate,
    },
    runningMode: 'VIDEO',
    numFaces,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
    minFaceDetectionConfidence: 0.7,
    minFacePresenceConfidence: 0.7,
    minTrackingConfidence: 0.7,
  })
}

export async function getFaceLandmarker(numFaces = 1): Promise<FaceLandmarker> {
  const key = Math.max(1, Math.min(10, Math.floor(numFaces)))
  let promise = landmarkerByFaces.get(key)
  if (!promise) {
    promise = createLandmarker('GPU', key).catch(async () => createLandmarker('CPU', key))
    landmarkerByFaces.set(key, promise)
  }
  return promise
}

function landmarksToPixels(
  landmarks: Array<{ x: number; y: number; z?: number }>,
  videoWidth: number,
  videoHeight: number,
): Point2[] {
  return landmarks.map((point) => ({
    x: point.x * videoWidth,
    y: point.y * videoHeight,
  }))
}

function boxFromPoints(points: Point2[]) {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const point of points) {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  }
}

function collectConnections(): Array<{ start: number; end: number }> {
  const groups = [
    FaceLandmarker.FACE_LANDMARKS_TESSELATION,
    FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
    FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
    FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
    FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
    FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
    FaceLandmarker.FACE_LANDMARKS_LIPS,
  ]

  const out: Array<{ start: number; end: number }> = []
  for (const group of groups) {
    for (const connection of group) {
      out.push({ start: connection.start, end: connection.end })
    }
  }
  return out
}

let cachedConnections: Array<{ start: number; end: number }> | null = null

function getConnections() {
  if (!cachedConnections) {
    cachedConnections = collectConnections()
  }
  return cachedConnections
}

function frameFromLandmark(
  face: Array<{ x: number; y: number; z?: number }>,
  result: FaceLandmarkerResult,
  index: number,
  videoWidth: number,
  videoHeight: number,
): MediaPipeFaceFrame {
  const positions = landmarksToPixels(face, videoWidth, videoHeight)
  const matrix = result.facialTransformationMatrixes?.[index]?.data
    ? Array.from(result.facialTransformationMatrixes[index].data)
    : null

  const blendshapes: Record<string, number> = {}
  const categories = result.faceBlendshapes?.[index]?.categories
  if (categories) {
    for (const category of categories) {
      if (category.categoryName) {
        blendshapes[category.categoryName] = category.score
      }
    }
  }

  return {
    detection: {
      box: boxFromPoints(positions),
      positions,
      score: 1,
    },
    matrix,
    connections: getConnections(),
    pointCount: face.length,
    blendshapes,
  }
}

export function detectFaceMeshFrames(
  landmarker: FaceLandmarker,
  video: HTMLVideoElement,
): MediaPipeFaceFrame[] {
  if (video.readyState < 2 || video.videoWidth < 2 || video.videoHeight < 2) {
    return []
  }

  let timestamp = Math.floor(performance.now())
  if (timestamp <= lastTimestamp) {
    timestamp = lastTimestamp + 1
  }
  lastTimestamp = timestamp

  const result: FaceLandmarkerResult = landmarker.detectForVideo(video, timestamp)
  const faces = result.faceLandmarks ?? []
  const frames: MediaPipeFaceFrame[] = []

  faces.forEach((face, index) => {
    if (!face || face.length < 468) return
    frames.push(frameFromLandmark(face, result, index, video.videoWidth, video.videoHeight))
  })

  return frames
}

export function detectFaceMeshFrame(
  landmarker: FaceLandmarker,
  video: HTMLVideoElement,
): MediaPipeFaceFrame | null {
  return detectFaceMeshFrames(landmarker, video)[0] ?? null
}
