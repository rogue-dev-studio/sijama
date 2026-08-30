/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 15:12:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 15:12:00
 */

import { useEffect, useId, useRef, useState } from 'react'
import { ApiError } from '../api/client'
import { profileService } from '../api/services'
import type { ProfileResult } from '../api/types'
import { isStoredKonfigAsset, resolveKonfigAssetUrl } from '../lib/konfigAsset'

type ProfileSignatureUploadProps = {
  signaturePath?: string | null
  disabled?: boolean
  onUpdated: (profile: ProfileResult) => void
  onError: (message: string) => void
}

function resolveSignatureSrc(path?: string | null): string | null {
  if (!path?.trim() || !isStoredKonfigAsset(path)) {
    return null
  }

  return resolveKonfigAssetUrl(path)
}

function formatUploadError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.errors) {
      const first = Object.values(err.errors).flat()[0]
      if (first) return first
    }
    return err.message
  }

  return 'Gagal memproses tanda tangan'
}

export function ProfileSignatureUpload({
  signaturePath,
  disabled = false,
  onUpdated,
  onError,
}: ProfileSignatureUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    setPreviewUrl(null)
  }, [signaturePath])

  const signatureSrc = previewUrl ?? resolveSignatureSrc(signaturePath)

  async function handleFileChange(file: File | undefined) {
    if (!file || disabled || busy) {
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setBusy(true)

    try {
      const result = await profileService.uploadSignature(file)
      setPreviewUrl(null)
      onUpdated(result)
    } catch (err) {
      setPreviewUrl(null)
      onError(formatUploadError(err))
    } finally {
      URL.revokeObjectURL(objectUrl)
      setBusy(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  async function handleDelete() {
    if (disabled || busy || !signaturePath?.trim()) {
      return
    }

    setBusy(true)

    try {
      const result = await profileService.deleteSignature()
      setPreviewUrl(null)
      onUpdated(result)
    } catch (err) {
      onError(formatUploadError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="profile-photo-upload profile-signature-upload">
      <div className="profile-photo-upload__preview profile-signature-upload__preview" aria-hidden={!signatureSrc}>
        {signatureSrc ? (
          <img src={signatureSrc} alt="" className="profile-photo-upload__image" />
        ) : (
          <span className="profile-photo-upload__placeholder">TTD</span>
        )}
      </div>
      <div className="profile-photo-upload__actions">
        <div className="field">
          <label htmlFor={inputId}>Tanda tangan</label>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            disabled={disabled || busy}
            onChange={(event) => void handleFileChange(event.target.files?.[0])}
          />
          <p className="field-hint">PNG/JPG dengan latar transparan disarankan. Maks. 2 MB.</p>
        </div>
        {signaturePath?.trim() && isStoredKonfigAsset(signaturePath) && (
          <button
            type="button"
            className="btn btn--ghost btn--small"
            disabled={disabled || busy}
            onClick={() => void handleDelete()}
          >
            Hapus tanda tangan
          </button>
        )}
        {busy && <p className="field-hint">Memproses tanda tangan…</p>}
      </div>
    </div>
  )
}
