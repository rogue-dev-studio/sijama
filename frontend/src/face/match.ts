import { faceapi } from './loadModels'

export const MATCH_THRESHOLD = 0.5

export interface FaceProfile {
  id: number
  nama: string
  descriptor: Float32Array
}

export function toFaceProfiles(
  items: Array<{ id: number; nama: string; face_descriptor?: number[] }>,
): FaceProfile[] {
  return items
    .filter((item) => Array.isArray(item.face_descriptor) && item.face_descriptor.length > 0)
    .map((item) => ({
      id: item.id,
      nama: item.nama,
      descriptor: new Float32Array(item.face_descriptor!),
    }))
}

export function findBestMatch(
  probe: Float32Array,
  profiles: FaceProfile[],
  options?: { excludeId?: number; threshold?: number },
): { profile: FaceProfile; distance: number } | null {
  const threshold = options?.threshold ?? MATCH_THRESHOLD
  let best: { profile: FaceProfile; distance: number } | null = null

  for (const profile of profiles) {
    if (options?.excludeId !== undefined && profile.id === options.excludeId) {
      continue
    }

    const distance = faceapi.euclideanDistance(probe, profile.descriptor)
    if (distance <= threshold && (!best || distance < best.distance)) {
      best = { profile, distance }
    }
  }

  return best
}
