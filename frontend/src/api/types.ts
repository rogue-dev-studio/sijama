export const TOKEN_KEY = 'sijama_token'

export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8080'

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  errors: Record<string, string[]> | null
}

export type PaginationMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface Paginated<T> {
  items: T[]
  meta: PaginationMeta
}

export type DapukanTingkat = 'global' | 'pusat' | 'daerah' | 'desa' | 'kelompok'

export interface WilayahSummary {
  id: number
  kode: string
  nama: string
}

export interface UserScope {
  pusat: WilayahSummary | null
  daerah: WilayahSummary | null
  desa: WilayahSummary | null
  kelompok: WilayahSummary | null
}

export interface Dapukan {
  id: number
  slug: string
  nama: string
  deskripsi: string | null
  tingkat: DapukanTingkat
  urutan: number
  is_system: boolean
  is_active: boolean
  hak_akses_ids?: number[]
  created_at?: string
  updated_at?: string
}

export type JamaahDapukanOption = Pick<Dapukan, 'id' | 'slug' | 'nama' | 'tingkat'>

export interface Pusat {
  id: number
  kode: string
  nama: string
  deskripsi: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Daerah {
  id: number
  pusat_id: number
  pusat?: WilayahSummary
  kode: string
  nama: string
  deskripsi: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface AdmNegara {
  id: number
  kode: string
  nama: string
  iso3: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface AdmProvinsi {
  id: number
  negara_id: number
  negara?: WilayahSummary
  kode: string
  nama: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface AdmKabupatenKota {
  id: number
  provinsi_id: number
  provinsi?: WilayahSummary
  kode: string
  nama: string
  jenis: 'kabupaten' | 'kota'
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface AdmKecamatan {
  id: number
  kabupaten_kota_id: number
  kabupaten_kota?: WilayahSummary
  kode: string
  nama: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface AdmDesaKelurahan {
  id: number
  kecamatan_id: number
  kecamatan?: WilayahSummary
  kode: string
  nama: string
  jenis: 'desa' | 'kelurahan' | 'desa_adat'
  /** Kode pos dari master bila tertaut ke desa/kelurahan */
  kode_pos?: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface AdmKodePos {
  id: number
  kode: string
  desa_kelurahan_id: number | null
  desa_kelurahan?: WilayahSummary | null
  kecamatan_id: number | null
  kecamatan?: WilayahSummary | null
  wilayah?: {
    negara: string | null
    provinsi: string | null
    kabupaten_kota: string | null
    kecamatan: string | null
    desa_kelurahan: string | null
  } | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Desa {
  id: number
  daerah_id: number
  daerah?: WilayahSummary
  kode: string
  nama: string
  deskripsi: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Kelompok {
  id: number
  desa_id: number
  desa?: WilayahSummary & { daerah_id?: number }
  kode: string
  nama: string
  deskripsi: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface SubKelompok {
  id: number
  kelompok_id: number
  kelompok?: WilayahSummary & { desa_id?: number }
  kode: string
  nama: string
  deskripsi: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface MenuNode {
  id: number
  slug: string
  nama: string
  path: string | null
  icon: string | null
  children: MenuNode[]
}

export interface Menu extends Omit<MenuNode, 'children'> {
  parent_id: number | null
  urutan: number
  is_active: boolean
  parent?: Menu | null
  created_at?: string
  updated_at?: string
}

export interface Fitur {
  id: number
  menu_id: number
  slug: string
  nama: string
  deskripsi: string | null
  is_active: boolean
  menu?: Menu
  created_at?: string
  updated_at?: string
}

export interface HakAkses {
  id: number
  fitur_id: number
  slug: string
  nama: string
  aksi: 'view' | 'create' | 'update' | 'delete' | 'execute'
  fitur?: Fitur
  created_at?: string
  updated_at?: string
}

export interface MasterUser {
  id: number
  name: string
  username: string
  email: string | null
  is_active: boolean
  jamaah_id?: number | null
  jamaah?: {
    id: number
    nama: string
    email: string | null
    no_hp?: string | null
    dapukan?: Array<{ id: number; slug: string; nama: string; tingkat: DapukanTingkat }>
  } | null
  dapukan?: { id: number; slug: string; nama: string; tingkat: DapukanTingkat }
  dapukan_list?: Array<{ id: number; slug: string; nama: string; tingkat: DapukanTingkat }>
  scope?: UserScope
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number
  name: string
  username: string
  email: string | null
  is_active: boolean
  jamaah_id?: number | null
  foto_path?: string | null
  path_tanda_tangan?: string | null
  no_hp?: string | null
  dapukan?: { id: number; slug: string; nama: string; tingkat: DapukanTingkat }
  dapukan_list?: Array<{ id: number; slug: string; nama: string; tingkat: DapukanTingkat }>
  scope?: UserScope
  created_at?: string
  updated_at?: string
}

export type DokumenTextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize'
export type DokumenFontStyle = 'normal' | 'italic'
export type DokumenTextAlign = 'left' | 'center' | 'right' | 'justify'

export type DokumenSignAlign = 'left' | 'center' | 'right'

export type DokumenSignMetaLayout = 'inline' | 'stack'

export type DokumenSignMetaOrder = 'name_first' | 'phone_first'
export type DokumenFontFamilyKey =
  | 'system-ui'
  | 'arial'
  | 'calibri'
  | 'times-new-roman'
  | 'georgia'
  | 'courier-new'
  | 'tahoma'
  | 'verdana'
  | 'segoe-ui'

export type DokumenPaperSize = 'a4' | 'letter' | 'legal' | 'a5' | 'folio'
export type DokumenPaperOrientation = 'portrait' | 'landscape'

export type DokumenPaperConfig = {
  paper_size: DokumenPaperSize
  paper_orientation: DokumenPaperOrientation
}

export interface DokumenHeaderStyle {
  header_font_family: DokumenFontFamilyKey
  header_font_size: number
  header_font_weight: string
  header_align: DokumenTextAlign
  header_color: string
  header_text_transform: DokumenTextTransform
  header_letter_spacing: number
  header_font_style: DokumenFontStyle
  header_underline: boolean
  header_strikethrough: boolean
  header_line_height: number
  header_detail_font_family: DokumenFontFamilyKey
  header_detail_font_size: number
  header_detail_font_weight: string
  header_detail_color: string
  header_detail_align: DokumenTextAlign
  header_detail_text_transform: DokumenTextTransform
  header_detail_letter_spacing: number
  header_detail_font_style: DokumenFontStyle
  header_detail_underline: boolean
  header_detail_strikethrough: boolean
  header_detail_line_height: number
  logo_max_height: number
  logo_max_width: number
  brand_border_width: number
  brand_border_color: string
  footer_font_family: DokumenFontFamilyKey
  footer_font_size: number
  footer_font_weight: string
  footer_text_transform: DokumenTextTransform
  footer_letter_spacing: number
  footer_font_style: DokumenFontStyle
  footer_underline: boolean
  footer_strikethrough: boolean
  footer_line_height: number
  body_font_family: DokumenFontFamilyKey
  body_font_size: number
  body_font_weight: string
  body_color: string
  body_font_style: DokumenFontStyle
  body_line_height: number
  body_align: DokumenTextAlign
  sign_block_position: DokumenSignAlign
  sign_content_align: DokumenSignAlign
  sign_meta_layout: DokumenSignMetaLayout
  sign_meta_order: DokumenSignMetaOrder
}

export type DokumenLayoutMode =
  | 'biasa'
  | 'kop_ganda'
  | 'kop_kiri'
  | 'kop_kanan'
  | 'kop_atas'
  | 'kop'
  | 'sederhana'

export interface AppDokumenSettings {
  lookup_id?: number
  lookup_name?: string | null
  lookup_value?: string | null
  lookup_urutan?: number | null
  konfigdokumen_id?: number | null
  header: string | null
  header_detail: string | null
  footer: string | null
  footer_detail: string | null
  path_logo_kiri?: string | null
  path_logo_kanan?: string | null
  layout_mode?: DokumenLayoutMode
  header_style?: DokumenHeaderStyle
  paper_size?: DokumenPaperSize
  paper_orientation?: DokumenPaperOrientation
  apply_pdf: boolean
  apply_excel: boolean
  apply_csv: boolean
  show_print_date?: boolean
  print_date_label?: string | null
  show_print_row_count?: boolean
  show_generated_by?: boolean
  column_visibility?:
    | {
        pdf?: Record<string, boolean> | null
        excel?: Record<string, boolean> | null
        csv?: Record<string, boolean> | null
      }
    | Record<string, boolean>
    | null
  show_user_signature?: boolean
  show_user_name?: boolean
  show_user_phone?: boolean
  is_configured?: boolean
  is_active?: boolean
}

export type AppDokumenPublic = {
  items: Record<string, AppDokumenSettings>
}

export interface AppPublicSettings {
  app_nama: string
  nama_instansi: string | null
  alamat: string | null
  telepon: string | null
  email_kontak: string | null
  timezone: string
  locale: string
  header: string | null
  footer: string | null
  website: string | null
  footer_link: string | null
  footer_detail: string | null
  footer_detail_link: string | null
  header_detail: string | null
  path_logoheader: string | null
  path_favicon: string | null
  path_logofooter: string | null
  path_background: string | null
  background_style: string
  background_repeat_size: string
  color_bg: string | null
  color_surface: string | null
  color_ink: string | null
  color_accent: string | null
  color_accent_soft: string | null
  color_muted: string | null
  color_border: string | null
  theme_color: string | null
  maintenance_mode: boolean
  maintenance_message: string
  maintenance_login_allowed: boolean
  path_maintenance_background: string | null
  maintenance_background_style: string
  maintenance_background_repeat_size: string
  password_reset_phone_enabled: boolean
  password_reset_email_enabled: boolean
  telegram_enabled: boolean
  n8n_enabled: boolean
  dokumen?: AppDokumenPublic
}

export interface AuthPayload {
  user: User
  permissions: string[]
  menus: MenuNode[]
  app_settings?: AppPublicSettings
}

export type LoginInput = {
  username: string
  password: string
  remember_me?: boolean
}

export interface LoginResult extends AuthPayload {
  token: string
}

export type ForgotPasswordInput = {
  identifier: string
}

export type ForgotPasswordResult = {
  channel: 'email' | 'phone' | 'unknown'
  masked_destination: string
  expires_in_minutes: number
}

export type ResetPasswordInput = {
  identifier: string
  password: string
  password_confirmation: string
  token?: string
  otp?: string
}

export type MeResult = AuthPayload

export type LookupOption = {
  id: number
  name: string
  value: string | null
  kode: string | null
}

export type OwnProfileInput = {
  nama?: string
  gender?: 'L' | 'P'
  tanggal_lahir?: string | null
  pekerjaan_id?: number | null
  pendidikan?: string | null
  golongan_darah?: string | null
  status_pernikahan?: string | null
  alamat?: string | null
  rt?: string
  rw?: string
  no_hp?: string
  email?: string | null
  adm_desa_kelurahan_id?: number | null
  kode_pos?: string | null
}

export type OwnPasswordInput = {
  current_password: string
  password: string
  password_confirmation: string
}

export type ProfileLoginSessionSettings = {
  login_remember_minutes: number | null
  login_remember_until_logout: boolean
  current_token_expires_at: string | null
  min_minutes: number
  max_minutes: number
  default_minutes: number
}

export type OwnLoginSessionInput = {
  login_remember_minutes: number | null
  login_remember_until_logout: boolean
}

export type ProfileAdmChain = {
  negara_id: number | null
  provinsi_id: number | null
  kabupaten_kota_id: number | null
  kecamatan_id: number | null
  desa_kelurahan_id: number | null
  labels: {
    negara: string | null
    provinsi: string | null
    kabupaten_kota: string | null
    kecamatan: string | null
    desa_kelurahan: string | null
  }
}

export type ProfileWilayahOption = {
  id: number
  kode: string
  nama: string
  kode_pos?: string | null
}

export type WilayahFromNikResult = {
  found: boolean
  kecamatan_kode: string | null
  negara_id?: number | null
  provinsi_id?: number | null
  kabupaten_kota_id?: number | null
  kecamatan_id?: number | null
  negara?: ProfileWilayahOption | null
  provinsi?: ProfileWilayahOption | null
  kabupaten_kota?: (ProfileWilayahOption & { jenis?: string }) | null
  kecamatan?: ProfileWilayahOption | null
}

export type ProfileResult = {
  user: User
  jamaah: Jamaah | null
  can_edit_jamaah: boolean
  adm_chain: ProfileAdmChain | null
  login_session: ProfileLoginSessionSettings
  lookups: {
    pekerjaan: Array<{ id: number; nama: string; value?: string | null }>
    jenis_kelamin: LookupOption[]
    golongan_darah: LookupOption[]
    status_pernikahan: LookupOption[]
    pendidikan: LookupOption[]
    negara: ProfileWilayahOption[]
  }
}

export type DapukanInput = {
  slug: string
  nama: string
  deskripsi?: string | null
  urutan?: number
  is_active?: boolean
}

export type MenuInput = {
  parent_id?: number | null
  slug: string
  nama: string
  path?: string | null
  icon?: string | null
  urutan?: number
  is_active?: boolean
}

export type FiturInput = {
  menu_id: number
  slug: string
  nama: string
  deskripsi?: string | null
  is_active?: boolean
}

export type HakAksesInput = {
  fitur_id: number
  slug: string
  nama: string
  aksi: HakAkses['aksi']
}

export type MasterUserInput = {
  name?: string
  username: string
  email?: string | null
  password?: string
  dapukan_id?: number
  jamaah_id: number
  pusat_id?: number | null
  daerah_id?: number | null
  desa_id?: number | null
  kelompok_id?: number | null
  is_active?: boolean
}

export type PusatInput = {
  kode: string
  nama: string
  deskripsi?: string | null
  is_active?: boolean
}

export type DaerahInput = {
  pusat_id: number
  kode: string
  nama: string
  deskripsi?: string | null
  is_active?: boolean
}

export type AdmNegaraInput = {
  kode: string
  nama: string
  iso3?: string | null
  is_active?: boolean
}

export type AdmProvinsiInput = {
  negara_id: number
  kode: string
  nama: string
  is_active?: boolean
}

export type AdmKabupatenKotaInput = {
  provinsi_id: number
  kode: string
  nama: string
  jenis: AdmKabupatenKota['jenis']
  is_active?: boolean
}

export type AdmKecamatanInput = {
  kabupaten_kota_id: number
  kode: string
  nama: string
  is_active?: boolean
}

export type AdmDesaKelurahanInput = {
  kecamatan_id: number
  kode: string
  nama: string
  jenis: AdmDesaKelurahan['jenis']
  is_active?: boolean
}

export type AdmKodePosInput = {
  kode: string
  desa_kelurahan_id: number
  is_active?: boolean
}

export type DesaInput = {
  daerah_id: number
  kode: string
  nama: string
  deskripsi?: string | null
  is_active?: boolean
}

export type KelompokInput = {
  desa_id: number
  kode: string
  nama: string
  deskripsi?: string | null
  is_active?: boolean
}

export type SubKelompokInput = {
  kelompok_id: number
  kode: string
  nama: string
  deskripsi?: string | null
  is_active?: boolean
}

export interface MatriksData {
  dapukan: Dapukan[]
  hak_akses: HakAkses[]
}

export interface Jamaah {
  id: number
  kelompok_id: number | null
  kelompok?: WilayahSummary | null
  nik: string | null
  nama: string
  gender: 'L' | 'P'
  tanggal_lahir: string | null
  kategori_umur: string | null
  kategori_umur_label?: string
  usia?: number | null
  pekerjaan: string | null
  pekerjaan_id?: number | null
  pekerjaan_ref?: MasterRef | null
  dapukan_ids?: number[]
  dapukan?: Array<{ id: number; slug: string; nama: string; tingkat: DapukanTingkat }>
  pendidikan: string | null
  golongan_darah?: string | null
  status_pernikahan: string | null
  alamat: string | null
  rt: string | null
  rw: string | null
  no_hp: string | null
  email: string | null
  adm_desa_kelurahan_id: number | null
  adm_desa_kelurahan?: WilayahSummary | null
  kode_pos: string | null
  status: 'aktif' | 'nonaktif'
  foto_path: string | null
  face_enrolled: boolean
  face_descriptor?: number[]
  enrolled_at: string | null
  created_at?: string
  updated_at?: string
}

export interface KeluargaAnggota {
  jamaah_id: number
  hubungan_keluarga: string
  hubungan_keluarga_label?: string | null
  is_kepala_keluarga: boolean
  catatan?: string | null
  jamaah?: {
    id: number
    nama: string
    nik: string | null
    gender: string
    tanggal_lahir: string | null
    no_hp: string | null
  } | null
}

export interface Keluarga {
  id: number
  kelompok_id: number
  kelompok?: { id: number; kode: string; nama: string } | null
  kepala_jamaah_id: number | null
  kepala_jamaah?: { id: number; nama: string; nik: string | null; no_hp: string | null } | null
  no_kk: string | null
  alamat: string | null
  rt: string | null
  rw: string | null
  adm_desa_kelurahan_id: number | null
  adm_desa_kelurahan?: WilayahSummary | null
  kode_pos: string | null
  catatan: string | null
  status: 'aktif' | 'nonaktif'
  anggota_count?: number
  anggota?: KeluargaAnggota[]
  created_at?: string
  updated_at?: string
}

export interface KeluargaAnggotaInput {
  jamaah_id: number
  hubungan_keluarga: string
  is_kepala_keluarga?: boolean
  catatan?: string | null
}

export interface KeluargaInput {
  kelompok_id?: number | null
  kepala_jamaah_id: number
  no_kk?: string | null
  alamat?: string | null
  rt?: string | null
  rw?: string | null
  adm_desa_kelurahan_id?: number | null
  kode_pos?: string | null
  catatan?: string | null
  status?: 'aktif' | 'nonaktif'
  anggota?: KeluargaAnggotaInput[]
}

export type KeluargaJamaahOption = Pick<
  Jamaah,
  | 'id'
  | 'kelompok_id'
  | 'nama'
  | 'nik'
  | 'no_hp'
  | 'alamat'
  | 'rt'
  | 'rw'
  | 'adm_desa_kelurahan_id'
  | 'kode_pos'
>

export type LokasiJenis = 'masjid' | 'gsg' | 'ppm' | 'aula' | 'kantor' | 'lainnya'

export interface Lokasi {
  id: number
  nama: string
  jenis: LokasiJenis
  kota: string | null
  adm_desa_kelurahan_id?: number | null
  adm_desa_kelurahan?: WilayahSummary | null
  adm_kecamatan?: WilayahSummary | null
  adm_kabupaten_kota?: WilayahSummary | null
  adm_provinsi?: WilayahSummary | null
  alamat: string | null
  lat?: number | null
  lng?: number | null
  maps_place_id?: string | null
  maps_place_name?: string | null
  maps_url?: string | null
  deskripsi?: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Pemateri {
  id: number
  jamaah_id?: number | null
  jamaah?: { id: number; nama: string; no_hp: string | null; email: string | null } | null
  nama: string
  kontak: string | null
  deskripsi?: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface LookupM {
  id: number
  lookup_id: number
  lookup_type: string
  lookup_name: string | null
  nama: string
  lookup_value: string | null
  lookup_urutan: number | null
  lookup_kode: string | null
  additional_data: string | null
  is_active: boolean
  is_deleted: boolean
  created_date?: string | null
  last_modified_date?: string | null
}

export interface KonfigSystem {
  id: number
  konfigsystem_id: number
  nama: string
  app_nama: string | null
  nama_instansi: string | null
  alamat: string | null
  telepon: string | null
  email_kontak: string | null
  timezone: string | null
  locale: string | null
  mail_protocol: string | null
  smtp_hostname: string | null
  mail_parameter: string | null
  smtp_username: string | null
  smtp_password_set: boolean
  smtp_port: number | null
  smtp_timeout: number | null
  smtp_encryption: string | null
  mail_from_address: string | null
  mail_from_name: string | null
  mail_reply_to: string | null
  password_reset_phone_enabled: boolean
  password_reset_email_enabled: boolean
  sms_driver: string | null
  sms_country_code: string | null
  fonnte_token_set: boolean
  fonnte_endpoint: string | null
  telegram_enabled: boolean
  telegram_bot_token_set: boolean
  telegram_bot_username: string | null
  telegram_default_chat_id: string | null
  n8n_enabled: boolean
  n8n_base_url: string | null
  n8n_webhook_url: string | null
  n8n_api_key_set: boolean
  header: string | null
  footer: string | null
  website: string | null
  footer_link: string | null
  footer_detail: string | null
  footer_detail_link: string | null
  header_detail: string | null
  path_logoheader: string | null
  path_favicon: string | null
  path_logofooter: string | null
  path_background: string | null
  background_style: string
  background_repeat_size: string
  color_bg: string | null
  color_surface: string | null
  color_ink: string | null
  color_accent: string | null
  color_accent_soft: string | null
  color_muted: string | null
  color_border: string | null
  theme_color: string | null
  maintenance_mode: boolean
  maintenance_message: string | null
  path_maintenance_background: string | null
  maintenance_background_style: string
  maintenance_background_repeat_size: string
  additional_data: string | null
  is_active: boolean
  is_deleted: boolean
  created_date?: string | null
  last_modified_date?: string | null
}

export interface KonfigDokumen {
  id?: number
  konfigdokumen_id?: number | null
  lookup_id: number
  lookup_name?: string | null
  lookup_value?: string | null
  lookup_urutan?: number | null
  nama?: string
  header: string | null
  header_detail: string | null
  footer: string | null
  footer_detail: string | null
  path_logo_kiri?: string | null
  path_logo_kanan?: string | null
  layout_mode?: DokumenLayoutMode
  header_style?: DokumenHeaderStyle
  paper_size?: DokumenPaperSize
  paper_orientation?: DokumenPaperOrientation
  apply_pdf: boolean
  apply_excel: boolean
  apply_csv: boolean
  show_print_date?: boolean
  print_date_label?: string | null
  show_print_row_count?: boolean
  show_generated_by?: boolean
  column_visibility?:
    | {
        pdf?: Record<string, boolean> | null
        excel?: Record<string, boolean> | null
        csv?: Record<string, boolean> | null
      }
    | Record<string, boolean>
    | null
  show_user_signature?: boolean
  show_user_name?: boolean
  show_user_phone?: boolean
  additional_data?: string | null
  is_active: boolean
  is_deleted?: boolean
  is_configured?: boolean
  created_date?: string | null
  last_modified_date?: string | null
}

export interface Materi {
  id: number
  nama: string
  deskripsi: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface KategoriKegiatan {
  id: number
  nama: string
  deskripsi: string | null
  calendar_color?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type MasterRef = {
  id: number
  nama: string
}

export type LokasiRef = MasterRef & {
  jenis?: LokasiJenis | string
}

export interface Pengajian {
  id: number
  judul: string
  pemateri: string | null
  pemateri_id?: number | null
  pemateri_ref?: MasterRef | null
  lokasi: string | null
  lokasi_id?: number | null
  lokasi_ref?: LokasiRef | null
  materi_id?: number | null
  materi?: MasterRef | null
  kategori_kegiatan_id?: number | null
  kategori_kegiatan?: (MasterRef & { calendar_color?: string }) | null
  starts_at: string
  ends_at: string | null
  catatan: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  created_at?: string
  updated_at?: string
}

export interface Kegiatan {
  id: number
  judul: string
  jenis: string | null
  kategori_kegiatan_id?: number | null
  kategori_kegiatan?: MasterRef | null
  tanggal: string
  lokasi: string | null
  lokasi_id?: number | null
  lokasi_ref?: LokasiRef | null
  deskripsi: string | null
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled'
  created_at?: string
  updated_at?: string
}

export interface AbsensiOverviewPoint {
  kode: string
  label: string
  value: number
}

export interface AbsensiOverviewTop extends AbsensiOverviewPoint {
  delta: number
}

export interface AbsensiOverviewPeriod {
  series: AbsensiOverviewPoint[]
  top: AbsensiOverviewTop[]
  total: number
  progress_pct: number
  period_label?: string
  from?: string
  to?: string
}

export interface DashboardStats {
  jamaah_aktif: number
  pengajian_minggu_ini: number
  absensi_hari_ini: number
  kegiatan_bulan_ini: number
  chart_absensi_7_hari: { label: string; value: number }[]
  absensi_overview: {
    week: AbsensiOverviewPeriod
    month: AbsensiOverviewPeriod
    year: AbsensiOverviewPeriod
  } | null
  chart_jamaah_per_kelompok: { label: string; value: number }[] | null
  chart_kategori_umur: { label: string; value: number }[] | null
}

export interface AttendanceSession {
  id: number
  type: 'pengajian' | 'kegiatan'
  ref_id: number
  title: string
  opened_by: number
  opened_at: string
  closed_at: string | null
  status: string
  attendance_count?: number
  attendances?: Attendance[]
  created_at?: string
}

export interface Attendance {
  id: number
  session_id: number
  jamaah_id: number
  method: 'face' | 'manual'
  matched_distance: number | null
  recorded_by: number
  recorded_at: string
  jamaah?: Jamaah
}

export interface LaporanKehadiranRow {
  id: number
  recorded_at: string | null
  method: 'face' | 'manual' | string
  jamaah_id: number
  jamaah_nama: string | null
  kelompok_nama: string | null
  session_id: number
  session_title: string | null
  session_type: string | null
  session_status: string | null
}

export type JamaahInput = {
  kelompok_id: number
  nik?: string | null
  nama: string
  gender: 'L' | 'P'
  tanggal_lahir?: string | null
  pekerjaan?: string | null
  pekerjaan_id?: number | null
  dapukan_ids?: number[]
  pendidikan?: string | null
  golongan_darah?: string | null
  status_pernikahan?: string | null
  alamat?: string | null
  rt?: string | null
  rw?: string | null
  no_hp?: string | null
  email?: string | null
  adm_desa_kelurahan_id?: number | null
  kode_pos?: string | null
  status?: 'aktif' | 'nonaktif'
  foto_path?: string | null
}

export type KategoriUmurMember = {
  id: number
  nama: string
  gender: 'L' | 'P'
  tanggal_lahir: string | null
  usia: number | null
  status_pernikahan?: string | null
  status_pernikahan_label?: string | null
  kategori_umur?: string | null
  kategori_umur_label?: string | null
  kelompok: WilayahSummary | null
}

export type KategoriUmurGroup = {
  kode: string | null
  nama: string
  grup: string
  rentang_usia: string
  jumlah: number
  items: KategoriUmurMember[]
}

export type KategoriUmurSummary = {
  asumsi_rentang: Array<{
    kode: string
    nama: string
    grup: string
    rentang_usia: string
  }>
  kategori: KategoriUmurGroup[]
  belum_diklasifikasi: KategoriUmurGroup
  total_aktif: number
}

export type KategoriUmurRingkasanRow = {
  kode: string | null
  nama: string
  grup: string
  rentang_usia: string
  jumlah: number
}

export type KategoriUmurList = Paginated<KategoriUmurMember> & {
  ringkasan: KategoriUmurRingkasanRow[]
}

export type LokasiInput = {
  nama: string
  jenis: LokasiJenis
  kota?: string | null
  adm_desa_kelurahan_id?: number | null
  alamat?: string | null
  lat?: number | null
  lng?: number | null
  maps_place_id?: string | null
  maps_place_name?: string | null
  maps_url?: string | null
  deskripsi?: string | null
  is_active?: boolean
}

export type MapsLocationResolveResult = {
  lat: number
  lng: number
  resolved_via: 'parse' | 'redirect' | 'geocode' | 'place_name' | 'coords'
  source_url?: string
  place_name?: string
  place_id?: string
  maps_url?: string
  display_name?: string | null
  alamat?: string | null
  adm?: {
    negara_id: number | null
    provinsi_id: number | null
    kabupaten_kota_id: number | null
    kecamatan_id: number | null
    desa_kelurahan_id: number | null
    labels: {
      negara?: string | null
      provinsi?: string | null
      kabupaten_kota?: string | null
      kecamatan?: string | null
      desa_kelurahan?: string | null
    }
  } | null
}

export type MapsPlaceSearchItem = {
  name: string
  display_name: string
  lat: number
  lng: number
}

export type PemateriInput = {
  jamaah_id: number
  nama?: string | null
  kontak?: string | null
  deskripsi?: string | null
  is_active?: boolean
}

export type LookupMInput = {
  lookup_type: string
  lookup_name?: string | null
  lookup_value?: string | null
  lookup_urutan?: number | null
  lookup_kode?: string | null
  additional_data?: string | null
  is_active?: boolean
}

export type KonfigSystemInput = {
  app_nama?: string | null
  nama_instansi?: string | null
  alamat?: string | null
  telepon?: string | null
  email_kontak?: string | null
  timezone?: string | null
  locale?: string | null
  mail_protocol?: string | null
  smtp_hostname?: string | null
  mail_parameter?: string | null
  smtp_username?: string | null
  smtp_password?: string | null
  smtp_port?: number | null
  smtp_timeout?: number | null
  smtp_encryption?: string | null
  mail_from_address?: string | null
  mail_from_name?: string | null
  mail_reply_to?: string | null
  password_reset_phone_enabled?: boolean
  password_reset_email_enabled?: boolean
  sms_driver?: string | null
  sms_country_code?: string | null
  fonnte_token?: string | null
  fonnte_endpoint?: string | null
  telegram_enabled?: boolean
  telegram_bot_token?: string | null
  telegram_bot_username?: string | null
  telegram_default_chat_id?: string | null
  n8n_enabled?: boolean
  n8n_base_url?: string | null
  n8n_webhook_url?: string | null
  n8n_api_key?: string | null
  header?: string | null
  footer?: string | null
  website?: string | null
  footer_link?: string | null
  footer_detail?: string | null
  footer_detail_link?: string | null
  header_detail?: string | null
  path_logoheader?: string | null
  path_favicon?: string | null
  path_logofooter?: string | null
  path_background?: string | null
  background_style?: string
  background_repeat_size?: string
  color_bg?: string | null
  color_surface?: string | null
  color_ink?: string | null
  color_accent?: string | null
  color_accent_soft?: string | null
  color_muted?: string | null
  color_border?: string | null
  theme_color?: string | null
  maintenance_mode?: boolean
  maintenance_message?: string | null
  path_maintenance_background?: string | null
  maintenance_background_style?: string
  maintenance_background_repeat_size?: string
  additional_data?: string | null
  is_active?: boolean
}

export type KonfigDokumenInput = {
  lookup_id: number
  header?: string | null
  header_detail?: string | null
  footer?: string | null
  footer_detail?: string | null
  layout_mode?: DokumenLayoutMode
  header_style?: Partial<DokumenHeaderStyle> | null
  paper_size?: DokumenPaperSize
  paper_orientation?: DokumenPaperOrientation
  apply_pdf?: boolean
  apply_excel?: boolean
  apply_csv?: boolean
  show_print_date?: boolean
  print_date_label?: string | null
  show_print_row_count?: boolean
  show_generated_by?: boolean
  column_visibility?:
    | {
        pdf?: Record<string, boolean> | null
        excel?: Record<string, boolean> | null
        csv?: Record<string, boolean> | null
      }
    | Record<string, boolean>
    | null
  show_user_signature?: boolean
  show_user_name?: boolean
  show_user_phone?: boolean
  additional_data?: string | null
  is_active?: boolean
}

export type KonfigDokumenAssetKind = 'logo-kiri' | 'logo-kanan'

export type MateriInput = {
  nama: string
  deskripsi?: string | null
  is_active?: boolean
}

export type KategoriKegiatanInput = {
  nama: string
  deskripsi?: string | null
  calendar_color?: string
  is_active?: boolean
}

export type PengajianInput = {
  judul: string
  pemateri?: string | null
  pemateri_id?: number | null
  lokasi?: string | null
  lokasi_id?: number | null
  materi_id?: number | null
  kategori_kegiatan_id?: number | null
  starts_at: string
  ends_at?: string | null
  catatan?: string | null
  status?: Pengajian['status']
}

export type KegiatanInput = {
  judul: string
  jenis?: string | null
  kategori_kegiatan_id?: number | null
  tanggal: string
  lokasi?: string | null
  lokasi_id?: number | null
  deskripsi?: string | null
  status?: Kegiatan['status']
}

export type OpenSessionInput = {
  type: 'pengajian' | 'kegiatan'
  ref_id: number
  title: string
}

export type CheckInInput = {
  jamaah_id: number
  method: 'face' | 'manual'
  matched_distance?: number
}

export type CalendarEvent = {
  id: number
  type: 'kegiatan' | 'pengajian'
  title: string
  time_label: string | null
  status: string
  color: string
  kategori_id: number | null
  kategori_nama: string | null
}

export type CalendarHoliday = {
  id: number
  tanggal?: string
  nama: string
  jenis: string
}

export type CalendarDay = {
  date: string
  is_friday: boolean
  holiday: CalendarHoliday | null
  events: CalendarEvent[]
}

export type CalendarLegendItem = {
  id: number
  nama: string
  color: string
}

export type CalendarMonth = {
  year: number
  month: number
  days: CalendarDay[]
  holidays: Array<CalendarHoliday & { tanggal: string }>
  legend: CalendarLegendItem[]
}
