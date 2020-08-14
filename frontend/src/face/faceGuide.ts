/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 21:12:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-02 21:12:00
 */
/** Guide oval ratios relative to video frame (KTP-style face hole). */
export const FACE_GUIDE = {
  cxRatio: 0.5,
  cyRatio: 0.48,
  rxRatio: 0.27,
  ryRatio: 0.36,
} as const

export function isPointInFaceGuide(
  x: number,
  y: number,
  videoWidth: number,
  videoHeight: number,
  padding = 0,
): boolean {
  const cx = videoWidth * FACE_GUIDE.cxRatio
  const cy = videoHeight * FACE_GUIDE.cyRatio
  const rx = videoWidth * FACE_GUIDE.rxRatio + padding
  const ry = videoHeight * FACE_GUIDE.ryRatio + padding
  if (rx <= 0 || ry <= 0) return false
  const nx = (x - cx) / rx
  const ny = (y - cy) / ry
  return nx * nx + ny * ny <= 1
}
