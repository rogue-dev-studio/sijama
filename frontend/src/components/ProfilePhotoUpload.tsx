/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:45:00
 */

import { useEffect, useId, useRef, useState } from 'react'
import { ApiError, fetchAuthenticatedMediaBlob } from '../api/client'
import { profileService } from '../api/services'
import type { ProfileResult } from '../api/types'
import { isProtectedStoragePath, isStoredKonfigAsset, resolveKonfigAssetUrl } from '../lib/konfigAsset'
import { MenuIcon } from './MenuIcon'

type ProfilePhotoUploadProps = {
  fotoPath?: string | null
  disabled?: boolean
  onUpdated: (profile: ProfileResult) => void
  onError: (message: string) => void
}

function resolvePhotoSrc(path?: string | null): string | null {
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

  return 'Gagal memproses foto profil'
}

export function ProfilePhotoUpload({
  fotoPath,
  disabled = false,
  onUpdated,
  onError,
}: ProfilePhotoUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [protectedSrc, setProtectedSrc] = useState<string | null>(null)

  useEffect(() => {
    setPreviewUrl(null)
  }, [fotoPath])

  useEffect(() => {
    let active = true
    let objectUrl: string | null = null

    if (!fotoPath?.trim() || !isProtectedStoragePath(fotoPath)) {
      setProtectedSrc(null)
      return () => {
        active = false
      }
    }

    void (async () => {
      const blob = await fetchAuthenticatedMediaBlob(fotoPath)
      if (!active) {
        return
      }

      if (!blob) {
        setProtectedSrc(null)
        return
      }

      objectUrl = URL.createObjectURL(blob)
      setProtectedSrc(objectUrl)
    })()

    return () => {
      active = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [fotoPath])

  const photoSrc =
    previewUrl ??
    protectedSrc ??
    (isProtectedStoragePath(fotoPath) ? null : resolvePhotoSrc(fotoPath))

  async function handleFileChange(file: File | undefined) {
    if (!file || disabled || busy) {
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setBusy(true)

    try {
      const result = await profileService.uploadPhoto(file)
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
    if (disabled || busy || !fotoPath?.trim()) {
      return
    }

    setBusy(true)

    try {
      const result = await profileService.deletePhoto()
      setPreviewUrl(null)
      onUpdated(result)
    } catch (err) {
      onError(formatUploadError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="profile-photo-upload">
      <div className="profile-photo-upload__preview" aria-hidden={!photoSrc}>
        {photoSrc ? (
          <img src={photoSrc} alt="" className="profile-photo-upload__image" />
        ) : (
          <span className="profile-photo-upload__placeholder">
            <MenuIcon name="user" size={32} />
          </span>
        )}
      </div>
      <div className="profile-photo-upload__actions">
        <div className="field">
          <label htmlFor={inputId}>Foto profil</label>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            disabled={disabled || busy}
            onChange={(event) => void handleFileChange(event.target.files?.[0])}
          />
          <p className="field-hint">JPG, PNG, GIF, atau WebP. Maks. 2 MB.</p>
        </div>
        {fotoPath?.trim() && isStoredKonfigAsset(fotoPath) && (
          <button
            type="button"
            className="btn btn--ghost btn--small"
            disabled={disabled || busy}
            onClick={() => void handleDelete()}
          >
            Hapus foto
          </button>
        )}
        {busy && <p className="field-hint">Memproses foto…</p>}
      </div>
    </div>
  )
}
