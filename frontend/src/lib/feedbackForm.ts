/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 17:21:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:21:00
 */

export const MAX_FEEDBACK_IMAGES = 5

export function defaultContactFromUser(user?: {
  email?: string | null
  no_hp?: string | null
} | null): string {
  return (user?.email?.trim() || user?.no_hp?.trim() || '')
}

export function createFeedbackFormData(
  fields: Record<string, string | number | null | undefined>,
  images: File[],
): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined) continue
    const text = String(value).trim()
    if (text === '') continue
    formData.append(key, String(value))
  }
  for (const file of images.slice(0, MAX_FEEDBACK_IMAGES)) {
    formData.append('images[]', file)
  }
  return formData
}

export function pickImageFiles(fileList: FileList | null, current: File[]): File[] {
  if (!fileList?.length) return current
  const next = [...current]
  for (const file of Array.from(fileList)) {
    if (!file.type.startsWith('image/')) continue
    if (next.length >= MAX_FEEDBACK_IMAGES) break
    next.push(file)
  }
  return next
}
