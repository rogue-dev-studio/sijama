/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:36:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 11:36:00
 */

import { useEffect, useId, useRef, useState } from 'react'
import {
  isStoredKonfigAsset,
  resolveKonfigAssetUrl,
  type ImageUploadAssetKind,
} from '../lib/konfigAsset'

type KonfigImageUploadProps = {
  label: string
  hint?: string
  asset: ImageUploadAssetKind
  savedPath?: string | null
  pendingFile?: File | null
  markedForDelete?: boolean
  disabled?: boolean
  pendingSaveLabel?: string
  onFileSelected: (file: File | null) => void
  onMarkDelete: () => void
  onCancelDelete: () => void
}

function resolvePreviewSrc(
  savedPath: string | null | undefined,
  pendingPreviewUrl: string | null,
  markedForDelete: boolean,
): string | null {
  if (markedForDelete) {
    return null
  }

  if (pendingPreviewUrl) {
    return pendingPreviewUrl
  }

  if (!savedPath?.trim() || !isStoredKonfigAsset(savedPath)) {
    return null
  }

  return resolveKonfigAssetUrl(savedPath)
}

export function KonfigImageUpload({
  label,
  hint,
  savedPath,
  pendingFile,
  markedForDelete = false,
  disabled = false,
  pendingSaveLabel = 'Simpan semua',
  onFileSelected,
  onMarkDelete,
  onCancelDelete,
}: KonfigImageUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(pendingFile)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [pendingFile])

  const previewSrc = resolvePreviewSrc(savedPath, previewUrl, markedForDelete)
  const canDeleteStored = Boolean(savedPath?.trim()) && isStoredKonfigAsset(savedPath) && !pendingFile

  function handleFileChange(file: File | undefined) {
    if (!file || disabled) {
      return
    }

    onFileSelected(file)
  }

  function handleClearPending() {
    onFileSelected(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="field konfig-image-upload">
      <label htmlFor={inputId}>{label}</label>
      <div className="konfig-image-upload__box">
        <div className="konfig-image-upload__row">
          <div className="konfig-image-upload__preview-slot" aria-hidden={!previewSrc}>
            {previewSrc ? (
              <img src={previewSrc} alt="" className="konfig-image-upload__preview" />
            ) : (
              <div className="konfig-image-upload__empty">—</div>
            )}
          </div>
          <div className="konfig-image-upload__file">
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml,image/x-icon,.ico"
              disabled={disabled}
              onChange={(event) => handleFileChange(event.target.files?.[0])}
            />
          </div>
        </div>
        <div className="konfig-image-upload__meta">
          {pendingFile && (
            <>
              <p className="field-hint">Menunggu disimpan — klik &quot;{pendingSaveLabel}&quot;.</p>
              <button type="button" className="btn btn--ghost btn--small" onClick={handleClearPending} disabled={disabled}>
                Batalkan pilihan
              </button>
            </>
          )}
          {markedForDelete && !pendingFile && (
            <>
              <p className="field-hint">Akan dihapus — klik &quot;{pendingSaveLabel}&quot;.</p>
              <button type="button" className="btn btn--ghost btn--small" onClick={onCancelDelete} disabled={disabled}>
                Batalkan hapus
              </button>
            </>
          )}
          {canDeleteStored && !markedForDelete && (
            <button type="button" className="btn btn--ghost btn--small" onClick={onMarkDelete} disabled={disabled}>
              Hapus gambar
            </button>
          )}
        </div>
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  )
}
