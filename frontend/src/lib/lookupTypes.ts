/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 12:34:39
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 12:34:39
 */

export const LOOKUP_TYPE = {
  PEKERJAAN: 'pekerjaan',
  JENIS_KELAMIN: 'jenis_kelamin',
  GOLONGAN_DARAH: 'golongan_darah',
  STATUS_PERNIKAHAN: 'status_pernikahan',
  PENDIDIKAN: 'pendidikan',
  HUBUNGAN_KELUARGA: 'hubungan_keluarga',
  KONFIG_DOKUMEN: 'konfig_dokumen',
} as const

export type LookupTypeKey = (typeof LOOKUP_TYPE)[keyof typeof LOOKUP_TYPE]

/** Types consumed by jamaah / profile forms (matches backend LookupTypes::JAMAAH_FORM_TYPES). */
export const JAMAAH_FORM_TYPES: Array<
  Exclude<(typeof LOOKUP_TYPE)[keyof typeof LOOKUP_TYPE], 'konfig_dokumen' | 'hubungan_keluarga'>
> = [
  LOOKUP_TYPE.PEKERJAAN,
  LOOKUP_TYPE.JENIS_KELAMIN,
  LOOKUP_TYPE.GOLONGAN_DARAH,
  LOOKUP_TYPE.STATUS_PERNIKAHAN,
  LOOKUP_TYPE.PENDIDIKAN,
]

/** Types exposed via lookup-options API (matches backend LookupTypes::OPTION_TYPES). */
export const LOOKUP_OPTION_TYPES = [
  ...JAMAAH_FORM_TYPES,
  LOOKUP_TYPE.HUBUNGAN_KELUARGA,
] as const

export type LookupOptionTypeKey = (typeof LOOKUP_OPTION_TYPES)[number]

export const LOOKUP_TYPE_LABELS: Record<LookupOptionTypeKey, string> = {
  [LOOKUP_TYPE.PEKERJAAN]: 'Pekerjaan',
  [LOOKUP_TYPE.JENIS_KELAMIN]: 'Jenis kelamin',
  [LOOKUP_TYPE.GOLONGAN_DARAH]: 'Golongan darah',
  [LOOKUP_TYPE.STATUS_PERNIKAHAN]: 'Status pernikahan',
  [LOOKUP_TYPE.PENDIDIKAN]: 'Pendidikan',
  [LOOKUP_TYPE.HUBUNGAN_KELUARGA]: 'Hubungan keluarga',
}

export const LOOKUP_TYPE_OPTIONS = LOOKUP_OPTION_TYPES.map((value) => ({
  value,
  label: LOOKUP_TYPE_LABELS[value],
}))
