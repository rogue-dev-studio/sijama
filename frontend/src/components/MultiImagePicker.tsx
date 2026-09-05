/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 17:21:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:21:00
 */

import { useEffect, useId, useState } from 'react'
import { MAX_FEEDBACK_IMAGES, pickImageFiles } from '../lib/feedbackForm'

type MultiImagePickerProps = {
  id?: string
  label?: string
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
}

export function MultiImagePicker({
  id,
  label = 'Lampiran gambar (opsional)',
  files,
  onChange,
  disabled = false,
}: MultiImagePickerProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url)
      }
    }
  }, [files])

  return (
    <div className="field" style={{ gridColumn: '1 / -1' }}>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        disabled={disabled || files.length >= MAX_FEEDBACK_IMAGES}
        onChange={(event) => {
          onChange(pickImageFiles(event.target.files, files))
          event.target.value = ''
        }}
      />
      <p className="form-hint">
        Maksimal {MAX_FEEDBACK_IMAGES} gambar (JPG/PNG/WebP/GIF, maks. 5 MB/file).
        {files.length > 0 ? ` Terpilih: ${files.length}.` : ''}
      </p>
      {previewUrls.length > 0 ? (
        <ul className="multi-image-picker__list">
          {previewUrls.map((url, index) => (
            <li key={`${url}-${index}`} className="multi-image-picker__item">
              <img src={url} alt="" className="multi-image-picker__thumb" />
              <button
                type="button"
                className="btn btn--secondary btn--small"
                disabled={disabled}
                onClick={() => onChange(files.filter((_, i) => i !== index))}
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
