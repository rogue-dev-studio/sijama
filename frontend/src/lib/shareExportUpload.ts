/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 17:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 17:20:00
 */

import { apiUploadRequest } from '../api/client'

export type ShareExportUploadResult = {
  path: string
  url: string
  filename: string
  expires_at: string
}

export async function uploadShareExport(file: File): Promise<ShareExportUploadResult> {
  const formData = new FormData()
  formData.append('file', file, file.name)
  return apiUploadRequest<ShareExportUploadResult>('/share/exports', formData)
}
