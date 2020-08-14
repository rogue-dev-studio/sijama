/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 20:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-02 20:55:00
 */
export type Point2 = { x: number; y: number }

export type FaceBox = {
  x: number
  y: number
  width: number
  height: number
}

export type FaceScanDetection = {
  box: FaceBox
  positions: Point2[]
  score?: number
}

type CoverRect = {
  offsetX: number
  offsetY: number
  scaleX: number
  scaleY: number
}

const MESH_COLOR_VALID = 'rgba(210, 255, 230, 0.82)'
const MESH_COLOR_INVALID = 'rgba(255, 220, 220, 0.78)'
const BOX_COLOR_VALID = 'rgba(46, 204, 113, 0.98)'
const BOX_COLOR_INVALID = 'rgba(231, 76, 60, 0.98)'
const MARKER_COLOR_VALID = '#2ecc71'
const MARKER_COLOR_INVALID = '#ff4fa3'
const CONTOUR_GROUPS: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  [17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26],
  [27, 28, 29, 30],
  [31, 32, 33, 34, 35],
  [36, 37, 38, 39, 40, 41, 36],
  [42, 43, 44, 45, 46, 47, 42],
  [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 48],
  [60, 61, 62, 63, 64, 65, 66, 67, 60],
]

const MESH_EDGES: Array<[number, number]> = [
  [27, 39],
  [27, 42],
  [28, 39],
  [28, 42],
  [29, 39],
  [29, 42],
  [30, 33],
  [33, 51],
  [39, 40],
  [40, 41],
  [42, 47],
  [47, 46],
  [36, 41],
  [45, 46],
  [31, 48],
  [35, 54],
  [48, 60],
  [54, 64],
  [51, 62],
  [57, 66],
  [3, 31],
  [13, 35],
  [8, 57],
]

const MARKER_INDEXES = [36, 39, 42, 45, 30, 33, 48, 54, 57, 51]

function getCoverRect(video: HTMLVideoElement, width: number, height: number): CoverRect {
  const videoRatio = video.videoWidth / video.videoHeight
  const viewRatio = width / height

  if (viewRatio > videoRatio) {
    const renderWidth = width
    const renderHeight = width / videoRatio
    return {
      offsetX: 0,
      offsetY: (height - renderHeight) / 2,
      scaleX: renderWidth / video.videoWidth,
      scaleY: renderHeight / video.videoHeight,
    }
  }

  const renderHeight = height
  const renderWidth = height * videoRatio
  return {
    offsetX: (width - renderWidth) / 2,
    offsetY: 0,
    scaleX: renderWidth / video.videoWidth,
    scaleY: renderHeight / video.videoHeight,
  }
}

function mapPoint(point: Point2, cover: CoverRect): Point2 {
  return {
    x: point.x * cover.scaleX + cover.offsetX,
    y: point.y * cover.scaleY + cover.offsetY,
  }
}

function drawPolyline(
  ctx: CanvasRenderingContext2D,
  points: Point2[],
  indexes: number[],
  cover: CoverRect,
) {
  if (indexes.length < 2) return
  ctx.beginPath()
  indexes.forEach((index, i) => {
    const point = points[index]
    if (!point) return
    const mapped = mapPoint(point, cover)
    if (i === 0) ctx.moveTo(mapped.x, mapped.y)
    else ctx.lineTo(mapped.x, mapped.y)
  })
  ctx.stroke()
}

function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath()
  ctx.moveTo(x - size, y)
  ctx.lineTo(x + size, y)
  ctx.moveTo(x, y - size)
  ctx.lineTo(x, y + size)
  ctx.stroke()
}

function drawFaceBox(
  ctx: CanvasRenderingContext2D,
  box: FaceBox,
  cover: CoverRect,
  color: string,
) {
  const x = box.x * cover.scaleX + cover.offsetX
  const y = box.y * cover.scaleY + cover.offsetY
  const w = box.width * cover.scaleX
  const h = box.height * cover.scaleY

  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, w, h)
}

export function clearFaceScanCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

export function syncFaceScanCanvas(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  const width = video.clientWidth
  const height = video.clientHeight
  if (width < 2 || height < 2) return null

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }

  return getCoverRect(video, width, height)
}

export function drawFaceScanOverlay(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  detection: FaceScanDetection | null,
  options?: {
    valid?: boolean
    connections?: Array<{ start: number; end: number }>
    markerIndexes?: number[]
    clear?: boolean
  },
) {
  const cover = syncFaceScanCanvas(canvas, video)
  const ctx = canvas.getContext('2d')
  if (!cover || !ctx) return

  if (options?.clear !== false) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  if (!detection || detection.positions.length < 68) return

  const valid = options?.valid !== false
  const boxColor = valid ? BOX_COLOR_VALID : BOX_COLOR_INVALID
  const meshColor = valid ? MESH_COLOR_VALID : MESH_COLOR_INVALID
  const markerColor = valid ? MARKER_COLOR_VALID : MARKER_COLOR_INVALID
  const isDense = detection.positions.length >= 468

  drawFaceBox(ctx, detection.box, cover, boxColor)

  ctx.strokeStyle = meshColor
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  if (isDense && options?.connections?.length) {
    ctx.lineWidth = 0.55
    ctx.globalAlpha = 0.42
    for (const connection of options.connections) {
      const a = detection.positions[connection.start]
      const b = detection.positions[connection.end]
      if (!a || !b) continue
      const pa = mapPoint(a, cover)
      const pb = mapPoint(b, cover)
      ctx.beginPath()
      ctx.moveTo(pa.x, pa.y)
      ctx.lineTo(pb.x, pb.y)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  } else {
    ctx.lineWidth = 1.1
    for (const group of CONTOUR_GROUPS) {
      drawPolyline(ctx, detection.positions, group, cover)
    }

    ctx.globalAlpha = 0.55
    for (const [from, to] of MESH_EDGES) {
      const a = detection.positions[from]
      const b = detection.positions[to]
      if (!a || !b) continue
      const pa = mapPoint(a, cover)
      const pb = mapPoint(b, cover)
      ctx.beginPath()
      ctx.moveTo(pa.x, pa.y)
      ctx.lineTo(pb.x, pb.y)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  const markers = options?.markerIndexes ?? (isDense ? [1, 33, 133, 263, 362, 61, 291, 152] : MARKER_INDEXES)
  ctx.strokeStyle = markerColor
  ctx.lineWidth = isDense ? 1.5 : 2
  for (const index of markers) {
    const point = detection.positions[index]
    if (!point) continue
    const mapped = mapPoint(point, cover)
    drawCross(ctx, mapped.x, mapped.y, isDense ? 3.5 : 5)
  }
}

export function drawFaceScanOverlays(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  detections: FaceScanDetection[],
  options?: {
    valid?: boolean
    connections?: Array<{ start: number; end: number }>
  },
) {
  const cover = syncFaceScanCanvas(canvas, video)
  const ctx = canvas.getContext('2d')
  if (!cover || !ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  detections.forEach((detection, index) => {
    drawFaceScanOverlay(canvas, video, detection, {
      ...options,
      clear: index === 0,
    })
  })
}
