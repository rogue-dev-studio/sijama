/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 12:10:54
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 12:10:54
 */

import { THEME_PALETTES, type ThemeColorSet, type ThemePalette } from '../lib/themeDefaults'

type ThemePalettePickerProps = {
  selectedId: string | null
  disabled?: boolean
  onSelect: (palette: ThemePalette) => void
}

function PaletteSwatches({ colors }: { colors: ThemeColorSet }) {
  const chips = [colors.color_bg, colors.color_surface, colors.color_accent, colors.color_accent_soft, colors.color_ink]

  return (
    <div className="theme-palette-card__swatches" aria-hidden="true">
      {chips.map((color, index) => (
        <span
          key={`${color}-${index}`}
          className="theme-palette-card__swatch"
          style={{ backgroundColor: color, borderColor: colors.color_border }}
        />
      ))}
    </div>
  )
}

export function ThemePalettePicker({ selectedId, disabled = false, onSelect }: ThemePalettePickerProps) {
  return (
    <div className="field" style={{ gridColumn: '1 / -1' }}>
      <h3 className="form-section-title">Palet tema</h3>
      <p className="field-hint">Pilih paket warna yang sudah diselaraskan. Bisa disesuaikan manual di bawah.</p>
      <div className="theme-palette-grid" role="listbox" aria-label="Palet tema siap pakai">
        {THEME_PALETTES.map((palette) => {
          const selected = selectedId === palette.id
          return (
            <button
              key={palette.id}
              type="button"
              role="option"
              aria-selected={selected}
              className={`theme-palette-card${selected ? ' theme-palette-card--selected' : ''}`}
              disabled={disabled}
              onClick={() => onSelect(palette)}
            >
              <PaletteSwatches colors={palette.colors} />
              <span className="theme-palette-card__name">{palette.name}</span>
              <span className="theme-palette-card__desc">{palette.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
