/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 21:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-02 21:40:00
 */
import type { FaceScanDetection, Point2 } from './drawFaceScan'

export type FaceVisibilityResult = {
  valid: boolean
  reason: string | null
}

const MIN_FACE_HEIGHT_RATIO = 0.18
const MAX_FACE_HEIGHT_RATIO = 0.78
const MIN_DETECTION_SCORE = 0.45
const MAX_YAW = 0.34
const MAX_ROLL_DEG = 20
const MAX_ASYMMETRY = 0.4
const MIN_EAR = 0.1
const MIN_MOUTH_WIDTH_RATIO = 0.26
const MAX_MATRIX_YAW_DEG = 26
const MAX_MATRIX_PITCH_DEG = 26
const MAX_MATRIX_ROLL_DEG = 22
const MAX_BLINK_SCORE = 0.58
const OCCLUSION_MSG = 'Wajah tertutupi. Singkirkan tangan/objek dan pastikan wajah terlihat jelas.'

const CRITICAL_LANDMARKS_68 = [
  0, 8, 16, 17, 21, 22, 26, 30, 33, 36, 39, 42, 45, 48, 54,
]

/** MediaPipe Face Mesh key points (468/478). */
const CRITICAL_LANDMARKS_MP = [
  1, 10, 33, 61, 133, 152, 234, 263, 291, 362, 454, 13, 14, 70, 300,
]

let sampleCanvas: HTMLCanvasElement | null = null
let sampleCtx: CanvasRenderingContext2D | null = null

function dist(a: Point2, b: Point2) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function midpoint(a: Point2, b: Point2): Point2 {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function eyeAspectRatio(positions: Point2[], indexes: number[]) {
  const [p1, p2, p3, p4, p5, p6] = indexes.map((index) => positions[index])
  if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) return 0
  return (dist(p2, p6) + dist(p3, p5)) / (2 * dist(p1, p4) + 1e-6)
}

function rotationFromMatrix(matrix: number[]) {
  const r00 = matrix[0]
  const r01 = matrix[4]
  const r02 = matrix[8]
  const r12 = matrix[9]
  const r22 = matrix[10]

  const pitch = Math.atan2(-r12, Math.hypot(r00, r01))
  const yaw = Math.atan2(r02, r22)
  const roll = Math.atan2(r01, r00)

  return {
    pitchDeg: (pitch * 180) / Math.PI,
    yawDeg: (yaw * 180) / Math.PI,
    rollDeg: (roll * 180) / Math.PI,
  }
}

function getSampleContext(width: number, height: number) {
  if (!sampleCanvas) {
    sampleCanvas = document.createElement('canvas')
    sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true })
  }
  if (!sampleCtx) return null
  if (sampleCanvas.width !== width || sampleCanvas.height !== height) {
    sampleCanvas.width = width
    sampleCanvas.height = height
  }
  return sampleCtx
}

function patchStats(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
): { mean: number; std: number; edge: number; darkRatio: number; range: number } | null {
  const size = Math.max(8, Math.round(radius * 2.2))
  const x = Math.max(0, Math.round(cx - size / 2))
  const y = Math.max(0, Math.round(cy - size / 2))
  const w = Math.min(size, ctx.canvas.width - x)
  const h = Math.min(size, ctx.canvas.height - y)
  if (w < 4 || h < 4) return null

  const { data } = ctx.getImageData(x, y, w, h)
  let sum = 0
  let sumSq = 0
  let edgeSum = 0
  let count = 0
  let minLum = 255
  let maxLum = 0
  const lums: number[] = []

  for (let row = 0; row < h; row += 1) {
    for (let col = 0; col < w; col += 1) {
      const i = (row * w + col) * 4
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      sum += lum
      sumSq += lum * lum
      count += 1
      lums.push(lum)
      minLum = Math.min(minLum, lum)
      maxLum = Math.max(maxLum, lum)

      if (col + 1 < w && row + 1 < h) {
        const right = (row * w + col + 1) * 4
        const down = ((row + 1) * w + col) * 4
        const lumR = 0.299 * data[right] + 0.587 * data[right + 1] + 0.114 * data[right + 2]
        const lumD = 0.299 * data[down] + 0.587 * data[down + 1] + 0.114 * data[down + 2]
        edgeSum += Math.abs(lum - lumR) + Math.abs(lum - lumD)
      }
    }
  }

  if (count < 8) return null
  const mean = sum / count
  const variance = Math.max(0, sumSq / count - mean * mean)
  const darkCut = mean * 0.72
  let darkCount = 0
  for (const lum of lums) {
    if (lum < darkCut) darkCount += 1
  }

  return {
    mean,
    std: Math.sqrt(variance),
    edge: edgeSum / count,
    darkRatio: darkCount / count,
    range: maxLum - minLum,
  }
}

type Patch = { mean: number; std: number; edge: number; darkRatio: number; range: number }

function isEyeRegionClear(eye: Patch, cheek: Patch, lightScale: number): boolean {
  const minEdge = 1.2 + 3.2 * lightScale
  const minRange = 7 + 14 * lightScale
  const minDark = 0.05 + 0.08 * lightScale

  const looksLikeSkinCover =
    Math.abs(eye.mean - cheek.mean) < 7 + 4 * (1 - lightScale) &&
    eye.edge <= cheek.edge * 1.05 + 0.8 &&
    eye.range <= cheek.range * 1.05 + 2

  if (looksLikeSkinCover) return false
  if (eye.edge < minEdge && eye.range < minRange) return false
  if (eye.darkRatio < minDark && eye.range < minRange * 1.1) return false
  return true
}

function assessOcclusionFromVideo(
  video: HTMLVideoElement,
  positions: Point2[],
): FaceVisibilityResult | null {
  const width = video.videoWidth
  const height = video.videoHeight
  const ctx = getSampleContext(width, height)
  if (!ctx) return null

  ctx.drawImage(video, 0, 0, width, height)

  const leftEye = midpoint(positions[33], positions[133])
  const rightEye = midpoint(positions[362], positions[263])
  const nose = positions[1]
  const mouth = midpoint(positions[61], positions[291])
  const brow = positions[10]
  const cheekLeft = positions[234]
  const cheekRight = positions[454]
  if (!leftEye || !rightEye || !nose || !mouth || !brow || !cheekLeft || !cheekRight) {
    return {
      valid: false,
      reason: 'Bagian wajah belum terdeteksi. Hadapkan wajah lurus ke kamera.',
    }
  }

  const interocular = dist(leftEye, rightEye)
  const eyeRadius = Math.max(7, interocular * 0.2)
  const faceRadius = Math.max(6, interocular * 0.16)

  const leftEyeStats = patchStats(ctx, leftEye.x, leftEye.y, eyeRadius)
  const rightEyeStats = patchStats(ctx, rightEye.x, rightEye.y, eyeRadius)
  const noseStats = patchStats(ctx, nose.x, nose.y, faceRadius)
  const mouthStats = patchStats(ctx, mouth.x, mouth.y, faceRadius)
  const browStats = patchStats(ctx, brow.x, brow.y, faceRadius)
  const cheekLeftStats = patchStats(ctx, cheekLeft.x, cheekLeft.y, faceRadius)
  const cheekRightStats = patchStats(ctx, cheekRight.x, cheekRight.y, faceRadius)

  if (
    !leftEyeStats ||
    !rightEyeStats ||
    !noseStats ||
    !mouthStats ||
    !browStats ||
    !cheekLeftStats ||
    !cheekRightStats
  ) {
    return null
  }

  const faceMean =
    (leftEyeStats.mean +
      rightEyeStats.mean +
      noseStats.mean +
      mouthStats.mean +
      browStats.mean +
      cheekLeftStats.mean +
      cheekRightStats.mean) /
    7
  const lightScale = Math.min(1, Math.max(0.25, faceMean / 90))
  const cheek: Patch = {
    mean: (cheekLeftStats.mean + cheekRightStats.mean) / 2,
    std: (cheekLeftStats.std + cheekRightStats.std) / 2,
    edge: (cheekLeftStats.edge + cheekRightStats.edge) / 2,
    darkRatio: (cheekLeftStats.darkRatio + cheekRightStats.darkRatio) / 2,
    range: (cheekLeftStats.range + cheekRightStats.range) / 2,
  }

  if (!isEyeRegionClear(leftEyeStats, cheek, lightScale) || !isEyeRegionClear(rightEyeStats, cheek, lightScale)) {
    return { valid: false, reason: OCCLUSION_MSG }
  }

  const minFeatureEdge = 1.1 + 2.8 * lightScale
  const minFeatureRange = 5 + 10 * lightScale
  let coveredFeatures = 0
  for (const feature of [noseStats, mouthStats, browStats]) {
    const likeCheek =
      Math.abs(feature.mean - cheek.mean) < 8 &&
      feature.edge <= cheek.edge * 1.02 + 0.6 &&
      feature.range <= cheek.range * 1.05 + 2
    if (likeCheek || (feature.edge < minFeatureEdge && feature.range < minFeatureRange)) {
      coveredFeatures += 1
    }
  }
  if (coveredFeatures >= 3) {
    return { valid: false, reason: OCCLUSION_MSG }
  }

  const regionMeans = [
    leftEyeStats.mean,
    rightEyeStats.mean,
    noseStats.mean,
    mouthStats.mean,
    browStats.mean,
  ]
  const meanAvg = regionMeans.reduce((a, b) => a + b, 0) / regionMeans.length
  const meanSpread = Math.sqrt(
    regionMeans.reduce((sum, value) => sum + (value - meanAvg) ** 2, 0) / regionMeans.length,
  )
  const avgEdge =
    (leftEyeStats.edge + rightEyeStats.edge + noseStats.edge + mouthStats.edge + browStats.edge) / 5
  if (meanSpread < 2.8 + 2 * lightScale && avgEdge < 1.6 + 2.8 * lightScale) {
    return { valid: false, reason: OCCLUSION_MSG }
  }

  return null
}

function assessBlendshapes(blendshapes?: Record<string, number> | null): FaceVisibilityResult | null {
  if (!blendshapes) return null

  const blinkLeft = blendshapes.eyeBlinkLeft ?? 0
  const blinkRight = blendshapes.eyeBlinkRight ?? 0
  if (blinkLeft > MAX_BLINK_SCORE || blinkRight > MAX_BLINK_SCORE) {
    return {
      valid: false,
      reason: 'Mata tertutup atau tertutupi. Pastikan wajah terlihat jelas.',
    }
  }

  return null
}

function assessPoseMatrix(matrix: number[] | null | undefined): FaceVisibilityResult | null {
  if (!matrix || matrix.length < 16) return null

  const { yawDeg, pitchDeg, rollDeg } = rotationFromMatrix(matrix)
  if (Math.abs(yawDeg) > MAX_MATRIX_YAW_DEG) {
    return {
      valid: false,
      reason: 'Wajah miring ke samping. Hadapkan wajah lurus ke kamera.',
    }
  }
  if (Math.abs(pitchDeg) > MAX_MATRIX_PITCH_DEG) {
    return {
      valid: false,
      reason: 'Sudut wajah belum tepat. Hadapkan wajah lurus ke kamera.',
    }
  }
  if (Math.abs(rollDeg) > MAX_MATRIX_ROLL_DEG) {
    return {
      valid: false,
      reason: 'Wajah miring. Tegakkan kepala menghadap kamera.',
    }
  }
  return { valid: true, reason: null }
}

function assessPoseAndOcclusion68(positions: Point2[], boxWidth: number): FaceVisibilityResult | null {
  const leftOuter = positions[36]
  const leftInner = positions[39]
  const rightInner = positions[42]
  const rightOuter = positions[45]
  const noseTip = positions[30]
  const noseBridge = positions[27]
  const chin = positions[8]
  const jawLeft = positions[3]
  const jawRight = positions[13]
  const mouthLeft = positions[48]
  const mouthRight = positions[54]
  const browLeft = positions[19]
  const browRight = positions[24]

  if (
    !leftOuter ||
    !leftInner ||
    !rightInner ||
    !rightOuter ||
    !noseTip ||
    !noseBridge ||
    !chin ||
    !jawLeft ||
    !jawRight ||
    !mouthLeft ||
    !mouthRight ||
    !browLeft ||
    !browRight
  ) {
    return {
      valid: false,
      reason: 'Bagian wajah belum terdeteksi. Hadapkan wajah lurus ke kamera.',
    }
  }

  const leftEye = midpoint(leftOuter, leftInner)
  const rightEye = midpoint(rightInner, rightOuter)
  const eyeMid = midpoint(leftEye, rightEye)
  const interocular = dist(leftEye, rightEye)
  if (interocular < boxWidth * 0.14) {
    return {
      valid: false,
      reason: 'Wajah belum menghadap kamera. Hadapkan wajah lurus ke depan.',
    }
  }

  const yaw = (noseTip.x - eyeMid.x) / interocular
  if (Math.abs(yaw) > MAX_YAW) {
    return {
      valid: false,
      reason: 'Wajah miring ke samping. Hadapkan wajah lurus ke kamera.',
    }
  }

  const rollDeg = (Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * 180) / Math.PI
  if (Math.abs(rollDeg) > MAX_ROLL_DEG) {
    return {
      valid: false,
      reason: 'Wajah miring. Tegakkan kepala menghadap kamera.',
    }
  }

  const eyeToChinY = chin.y - eyeMid.y
  if (eyeToChinY < interocular * 0.6) {
    return {
      valid: false,
      reason: 'Wajah belum menghadap kamera. Hadapkan wajah lurus ke depan.',
    }
  }
  const pitch = (noseTip.y - eyeMid.y) / (eyeToChinY + 1e-6)
  if (pitch < 0.24 || pitch > 0.68) {
    return {
      valid: false,
      reason: 'Sudut wajah belum tepat. Hadapkan wajah lurus ke kamera.',
    }
  }

  const leftDepth = dist(noseTip, jawLeft)
  const rightDepth = dist(noseTip, jawRight)
  const asymmetry = Math.abs(leftDepth - rightDepth) / ((leftDepth + rightDepth) / 2 + 1e-6)
  if (asymmetry > MAX_ASYMMETRY) {
    return {
      valid: false,
      reason: 'Wajah tidak menghadap kamera. Hadapkan wajah ke depan.',
    }
  }

  const leftEar = eyeAspectRatio(positions, [36, 37, 38, 39, 40, 41])
  const rightEar = eyeAspectRatio(positions, [42, 43, 44, 45, 46, 47])
  if (leftEar < MIN_EAR || rightEar < MIN_EAR) {
    return {
      valid: false,
      reason: 'Mata tertutup atau tertutupi. Pastikan wajah terlihat jelas.',
    }
  }

  const mouthWidth = dist(mouthLeft, mouthRight)
  if (mouthWidth < interocular * MIN_MOUTH_WIDTH_RATIO) {
    return {
      valid: false,
      reason: 'Mulut/bagian bawah wajah tertutupi atau tidak menghadap kamera.',
    }
  }

  const browGap =
    (dist(browLeft, leftEye) + dist(browRight, rightEye)) / 2 / (interocular + 1e-6)
  if (browGap < 0.08) {
    return {
      valid: false,
      reason: 'Bagian atas wajah tertutupi. Pastikan dahi dan mata terlihat.',
    }
  }

  const noseOffsetY = (noseTip.y - noseBridge.y) / (eyeToChinY + 1e-6)
  if (noseOffsetY < 0.08) {
    return {
      valid: false,
      reason: 'Wajah belum menghadap kamera dengan jelas.',
    }
  }

  return null
}

function assessPoseAndOcclusionMp(
  positions: Point2[],
  boxWidth: number,
  options?: {
    matrix?: number[] | null
    blendshapes?: Record<string, number> | null
    video?: HTMLVideoElement | null
  },
): FaceVisibilityResult | null {
  const matrixResult = assessPoseMatrix(options?.matrix)
  if (matrixResult && !matrixResult.valid) {
    return matrixResult
  }

  const blendResult = assessBlendshapes(options?.blendshapes)
  if (blendResult) return blendResult

  const noseTip = positions[1]
  const chin = positions[152]
  const leftOuter = positions[33]
  const leftInner = positions[133]
  const rightInner = positions[362]
  const rightOuter = positions[263]
  const mouthLeft = positions[61]
  const mouthRight = positions[291]
  const mouthTop = positions[13]
  const mouthBottom = positions[14]
  const cheekLeft = positions[234]
  const cheekRight = positions[454]
  const brow = positions[10]

  if (
    !noseTip ||
    !chin ||
    !leftOuter ||
    !leftInner ||
    !rightInner ||
    !rightOuter ||
    !mouthLeft ||
    !mouthRight ||
    !mouthTop ||
    !mouthBottom ||
    !cheekLeft ||
    !cheekRight ||
    !brow
  ) {
    return {
      valid: false,
      reason: 'Bagian wajah belum terdeteksi. Hadapkan wajah lurus ke kamera.',
    }
  }

  const leftEye = midpoint(leftOuter, leftInner)
  const rightEye = midpoint(rightInner, rightOuter)
  const eyeMid = midpoint(leftEye, rightEye)
  const interocular = dist(leftEye, rightEye)
  if (interocular < boxWidth * 0.14) {
    return {
      valid: false,
      reason: 'Wajah belum menghadap kamera. Hadapkan wajah lurus ke depan.',
    }
  }

  if (!matrixResult) {
    const yaw = (noseTip.x - eyeMid.x) / interocular
    if (Math.abs(yaw) > MAX_YAW) {
      return {
        valid: false,
        reason: 'Wajah miring ke samping. Hadapkan wajah lurus ke kamera.',
      }
    }
    const rollDeg = (Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * 180) / Math.PI
    if (Math.abs(rollDeg) > MAX_ROLL_DEG) {
      return {
        valid: false,
        reason: 'Wajah miring. Tegakkan kepala menghadap kamera.',
      }
    }
  }

  const leftEar = eyeAspectRatio(positions, [33, 160, 158, 133, 153, 144])
  const rightEar = eyeAspectRatio(positions, [362, 385, 387, 263, 373, 380])
  if (leftEar < MIN_EAR || rightEar < MIN_EAR) {
    return {
      valid: false,
      reason: 'Mata tertutup atau tertutupi. Pastikan wajah terlihat jelas.',
    }
  }

  const mouthWidth = dist(mouthLeft, mouthRight)
  if (mouthWidth < interocular * MIN_MOUTH_WIDTH_RATIO) {
    return {
      valid: false,
      reason: 'Mulut/bagian bawah wajah tertutupi atau tidak menghadap kamera.',
    }
  }

  const mouthOpen = dist(mouthTop, mouthBottom) / (interocular + 1e-6)
  if (mouthOpen > 0.72) {
    return {
      valid: false,
      reason: 'Bagian mulut tidak valid. Pastikan wajah terlihat jelas.',
    }
  }

  const cheekSpan = dist(cheekLeft, cheekRight)
  if (cheekSpan < interocular * 1.35) {
    return {
      valid: false,
      reason: 'Wajah tidak menghadap kamera. Hadapkan wajah ke depan.',
    }
  }

  const browToChin = chin.y - brow.y
  if (browToChin < interocular * 0.95) {
    return {
      valid: false,
      reason: 'Bagian wajah tertutupi. Pastikan wajah terlihat penuh.',
    }
  }

  const eyeToMouthY = (mouthTop.y + mouthBottom.y) / 2 - eyeMid.y
  const verticalRatio = eyeToMouthY / (browToChin + 1e-6)
  if (verticalRatio < 0.2 || verticalRatio > 0.65) {
    return {
      valid: false,
      reason: 'Proporsi wajah tidak valid. Singkirkan halangan di depan kamera.',
    }
  }

  if (brow.y > eyeMid.y - interocular * 0.02) {
    return {
      valid: false,
      reason: 'Bagian atas wajah tertutupi. Pastikan dahi dan mata terlihat.',
    }
  }

  if (noseTip.y < eyeMid.y - interocular * 0.05 || noseTip.y > mouthTop.y + interocular * 0.08) {
    return {
      valid: false,
      reason: 'Hidung tidak terlihat jelas. Pastikan wajah tidak tertutupi.',
    }
  }

  if (options?.video) {
    const textureResult = assessOcclusionFromVideo(options.video, positions)
    if (textureResult) return textureResult
  }

  return null
}

export function assessFaceVisibility(
  detection: FaceScanDetection,
  videoWidth: number,
  videoHeight: number,
  options?: {
    matrix?: number[] | null
    blendshapes?: Record<string, number> | null
    video?: HTMLVideoElement | null
  },
): FaceVisibilityResult {
  if (videoWidth < 2 || videoHeight < 2 || detection.positions.length < 68) {
    return {
      valid: false,
      reason: 'Wajah belum terdeteksi sepenuhnya.',
    }
  }

  const isMediaPipe = detection.positions.length >= 468

  if (!isMediaPipe && detection.score !== undefined && detection.score < MIN_DETECTION_SCORE) {
    return {
      valid: false,
      reason: 'Deteksi wajah kurang jelas. Perbaiki pencahayaan dan hadapkan wajah.',
    }
  }

  const { box, positions } = detection
  const faceCx = box.x + box.width / 2
  const faceCy = box.y + box.height / 2
  const centerDx = (faceCx - videoWidth * 0.5) / videoWidth
  const centerDy = (faceCy - videoHeight * 0.48) / videoHeight
  if (Math.abs(centerDx) > 0.38 || Math.abs(centerDy) > 0.36) {
    return {
      valid: false,
      reason: 'Posisikan wajah di tengah kamera.',
    }
  }

  const critical = isMediaPipe ? CRITICAL_LANDMARKS_MP : CRITICAL_LANDMARKS_68
  for (const index of critical) {
    const point = positions[index]
    if (!point) {
      return {
        valid: false,
        reason: 'Bagian wajah belum terdeteksi. Hadapkan wajah lurus ke kamera.',
      }
    }
    if (
      point.x < videoWidth * 0.04 ||
      point.x > videoWidth * 0.96 ||
      point.y < videoHeight * 0.03 ||
      point.y > videoHeight * 0.97
    ) {
      return {
        valid: false,
        reason: 'Wajah belum masuk penuh ke frame. Geser atau jauhkan sedikit.',
      }
    }
  }

  const faceHeightRatio = box.height / videoHeight
  if (faceHeightRatio < MIN_FACE_HEIGHT_RATIO) {
    return {
      valid: false,
      reason: 'Wajah terlalu jauh. Dekatkan ke kamera.',
    }
  }

  if (faceHeightRatio > MAX_FACE_HEIGHT_RATIO) {
    return {
      valid: false,
      reason: 'Wajah terlalu dekat. Jauhkan sedikit dari kamera.',
    }
  }

  if (box.width / videoWidth > 0.88 || box.height / videoHeight > 0.92) {
    return {
      valid: false,
      reason: 'Wajah terlalu dekat. Jauhkan sedikit dari kamera.',
    }
  }

  const poseResult = isMediaPipe
    ? assessPoseAndOcclusionMp(positions, box.width, options)
    : assessPoseAndOcclusion68(positions, box.width)
  if (poseResult) return poseResult

  return { valid: true, reason: null }
}
