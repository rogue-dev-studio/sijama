import { apiRequest } from './client'
import type {
  AdmDesaKelurahan,
  AdmDesaKelurahanInput,
  AdmKabupatenKota,
  AdmKabupatenKotaInput,
  AdmKecamatan,
  AdmKecamatanInput,
  AdmKodePos,
  AdmKodePosInput,
  AdmNegara,
  AdmNegaraInput,
  AdmProvinsi,
  AdmProvinsiInput,
  AttendanceSession,
  AbsensiOverviewPeriod,
  CalendarMonth,
  CheckInInput,
  Daerah,
  DaerahInput,
  DashboardStats,
  Desa,
  DesaInput,
  Dapukan,
  DapukanInput,
  Fitur,
  FiturInput,
  HakAkses,
  HakAksesInput,
  Jamaah,
  JamaahDapukanOption,
  JamaahInput,
  KategoriKegiatan,
  KategoriKegiatanInput,
  KategoriUmurSummary,
  Kegiatan,
  KegiatanInput,
  Kelompok,
  KelompokInput,
  LoginResult,
  Lokasi,
  LokasiInput,
  MapsLocationResolveResult,
  MapsPlaceSearchItem,
  MasterUser,
  MasterUserInput,
  Materi,
  MateriInput,
  MatriksData,
  MeResult,
  Menu,
  MenuInput,
  OpenSessionInput,
  OwnProfileInput,
  Paginated,
  Pekerjaan,
  PekerjaanInput,
  Pemateri,
  PemateriInput,
  Pengajian,
  PengajianInput,
  ProfileResult,
  ProfileWilayahOption,
  Pusat,
  PusatInput,
  SubKelompok,
  SubKelompokInput,
} from './types'

type ListQueryValue = string | number | boolean | undefined | null

function buildListQuery(entries: Array<[string, ListQueryValue]>): string {
  const search = new URLSearchParams()
  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === '') continue
    if (typeof value === 'number' && key.endsWith('_id') && value <= 0) continue
    if (typeof value === 'boolean') {
      search.set(key, value ? '1' : '0')
      continue
    }
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

export const authService = {
  login(username: string, password: string) {
    return apiRequest<LoginResult>('/login', {
      method: 'POST',
      body: { username, password },
      auth: false,
    })
  },
  logout() {
    return apiRequest<null>('/logout', { method: 'POST' })
  },
  me() {
    return apiRequest<MeResult>('/me')
  },
}

export const profileService = {
  get() {
    return apiRequest<ProfileResult>('/profile')
  },
  update(data: OwnProfileInput) {
    return apiRequest<ProfileResult>('/profile', { method: 'PUT', body: data })
  },
  wilayahOptions(level: string, parentId?: number | null) {
    return apiRequest<{ items: ProfileWilayahOption[] }>(
      `/profile/wilayah-options${buildListQuery([
        ['level', level],
        ['parent_id', parentId ?? undefined],
      ])}`,
    )
  },
}

export const masterPusatService = {
  list(params?: { q?: string; page?: number; per_page?: number }) {
    return apiRequest<Paginated<Pusat>>(
      `/master/pusat${buildListQuery([
        ['q', params?.q],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<Pusat>(`/master/pusat/${id}`)
  },
  create(data: PusatInput) {
    return apiRequest<Pusat>('/master/pusat', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<PusatInput>) {
    return apiRequest<Pusat>(`/master/pusat/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/pusat/${id}`, { method: 'DELETE' })
  },
}

export const masterLokasiService = {
  list(params?: {
    q?: string
    jenis?: string
    active_only?: boolean
    is_active?: boolean
    page?: number
    per_page?: number
  }) {
    return apiRequest<Paginated<Lokasi>>(
      `/master/lokasi${buildListQuery([
        ['q', params?.q],
        ['jenis', params?.jenis],
        ['active_only', params?.active_only],
        ['is_active', params?.is_active],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<Lokasi>(`/master/lokasi/${id}`)
  },
  create(data: LokasiInput) {
    return apiRequest<Lokasi>('/master/lokasi', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<LokasiInput>) {
    return apiRequest<Lokasi>(`/master/lokasi/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/lokasi/${id}`, { method: 'DELETE' })
  },
  resolveLocation(input: string) {
    return apiRequest<MapsLocationResolveResult>('/master/lokasi/resolve-location', {
      method: 'POST',
      body: { input },
    })
  },
  searchPlaces(q: string, limit = 6) {
    return apiRequest<{ items: MapsPlaceSearchItem[] }>(
      `/master/lokasi/search-places${buildListQuery([
        ['q', q],
        ['limit', limit],
      ])}`,
    )
  },
}

export const masterPemateriService = {
  list(params?: { q?: string; active_only?: boolean; is_active?: boolean; page?: number; per_page?: number }) {
    return apiRequest<Paginated<Pemateri>>(
      `/master/pemateri${buildListQuery([
        ['q', params?.q],
        ['active_only', params?.active_only],
        ['is_active', params?.is_active],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<Pemateri>(`/master/pemateri/${id}`)
  },
  create(data: PemateriInput) {
    return apiRequest<Pemateri>('/master/pemateri', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<PemateriInput>) {
    return apiRequest<Pemateri>(`/master/pemateri/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/pemateri/${id}`, { method: 'DELETE' })
  },
}

export const masterPekerjaanService = {
  list(params?: { q?: string; active_only?: boolean; is_active?: boolean; page?: number; per_page?: number }) {
    return apiRequest<Paginated<Pekerjaan>>(
      `/master/pekerjaan${buildListQuery([
        ['q', params?.q],
        ['active_only', params?.active_only],
        ['is_active', params?.is_active],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<Pekerjaan>(`/master/pekerjaan/${id}`)
  },
  create(data: PekerjaanInput) {
    return apiRequest<Pekerjaan>('/master/pekerjaan', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<PekerjaanInput>) {
    return apiRequest<Pekerjaan>(`/master/pekerjaan/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/pekerjaan/${id}`, { method: 'DELETE' })
  },
}

export const masterMateriService = {
  list(params?: { q?: string; active_only?: boolean; is_active?: boolean; page?: number; per_page?: number }) {
    return apiRequest<Paginated<Materi>>(
      `/master/materi${buildListQuery([
        ['q', params?.q],
        ['active_only', params?.active_only],
        ['is_active', params?.is_active],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<Materi>(`/master/materi/${id}`)
  },
  create(data: MateriInput) {
    return apiRequest<Materi>('/master/materi', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<MateriInput>) {
    return apiRequest<Materi>(`/master/materi/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/materi/${id}`, { method: 'DELETE' })
  },
}

export const masterKategoriKegiatanService = {
  list(params?: { q?: string; active_only?: boolean; is_active?: boolean; page?: number; per_page?: number }) {
    return apiRequest<Paginated<KategoriKegiatan>>(
      `/master/kategori-kegiatan${buildListQuery([
        ['q', params?.q],
        ['active_only', params?.active_only],
        ['is_active', params?.is_active],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<KategoriKegiatan>(`/master/kategori-kegiatan/${id}`)
  },
  create(data: KategoriKegiatanInput) {
    return apiRequest<KategoriKegiatan>('/master/kategori-kegiatan', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<KategoriKegiatanInput>) {
    return apiRequest<KategoriKegiatan>(`/master/kategori-kegiatan/${id}`, {
      method: 'PUT',
      body: data,
    })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/kategori-kegiatan/${id}`, { method: 'DELETE' })
  },
}

export const masterDaerahService = {
  list(params?: { q?: string; pusat_id?: number; page?: number; per_page?: number }) {
    return apiRequest<Paginated<Daerah>>(
      `/master/daerah${buildListQuery([
        ['q', params?.q],
        ['pusat_id', params?.pusat_id],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<Daerah>(`/master/daerah/${id}`)
  },
  create(data: DaerahInput) {
    return apiRequest<Daerah>('/master/daerah', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<DaerahInput>) {
    return apiRequest<Daerah>(`/master/daerah/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/daerah/${id}`, { method: 'DELETE' })
  },
}

export const masterDesaService = {
  list(params?: { q?: string; daerah_id?: number; page?: number; per_page?: number }) {
    return apiRequest<Paginated<Desa>>(
      `/master/desa${buildListQuery([
        ['q', params?.q],
        ['daerah_id', params?.daerah_id],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<Desa>(`/master/desa/${id}`)
  },
  create(data: DesaInput) {
    return apiRequest<Desa>('/master/desa', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<DesaInput>) {
    return apiRequest<Desa>(`/master/desa/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/desa/${id}`, { method: 'DELETE' })
  },
}

export const masterKelompokService = {
  list(params?: {
    q?: string
    desa_id?: number
    daerah_id?: number
    is_active?: boolean
    page?: number
    per_page?: number
  }) {
    return apiRequest<Paginated<Kelompok>>(
      `/master/kelompok${buildListQuery([
        ['q', params?.q],
        ['desa_id', params?.desa_id],
        ['daerah_id', params?.daerah_id],
        ['is_active', params?.is_active],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<Kelompok>(`/master/kelompok/${id}`)
  },
  create(data: KelompokInput) {
    return apiRequest<Kelompok>('/master/kelompok', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<KelompokInput>) {
    return apiRequest<Kelompok>(`/master/kelompok/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/kelompok/${id}`, { method: 'DELETE' })
  },
}

export const masterSubKelompokService = {
  list(params?: { q?: string; kelompok_id?: number; page?: number; per_page?: number }) {
    return apiRequest<Paginated<SubKelompok>>(
      `/master/sub-kelompok${buildListQuery([
        ['q', params?.q],
        ['kelompok_id', params?.kelompok_id],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<SubKelompok>(`/master/sub-kelompok/${id}`)
  },
  create(data: SubKelompokInput) {
    return apiRequest<SubKelompok>('/master/sub-kelompok', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<SubKelompokInput>) {
    return apiRequest<SubKelompok>(`/master/sub-kelompok/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/sub-kelompok/${id}`, { method: 'DELETE' })
  },
}

export const admNegaraService = {
  list(params?: { q?: string; page?: number; per_page?: number }) {
    return apiRequest<Paginated<AdmNegara>>(
      `/master/adm/negara${buildListQuery([
        ['q', params?.q],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<AdmNegara>(`/master/adm/negara/${id}`)
  },
  create(data: AdmNegaraInput) {
    return apiRequest<AdmNegara>('/master/adm/negara', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<AdmNegaraInput>) {
    return apiRequest<AdmNegara>(`/master/adm/negara/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/adm/negara/${id}`, { method: 'DELETE' })
  },
}

export const admProvinsiService = {
  list(params?: { q?: string; negara_id?: number; page?: number; per_page?: number }) {
    return apiRequest<Paginated<AdmProvinsi>>(
      `/master/adm/provinsi${buildListQuery([
        ['q', params?.q],
        ['negara_id', params?.negara_id],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<AdmProvinsi>(`/master/adm/provinsi/${id}`)
  },
  create(data: AdmProvinsiInput) {
    return apiRequest<AdmProvinsi>('/master/adm/provinsi', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<AdmProvinsiInput>) {
    return apiRequest<AdmProvinsi>(`/master/adm/provinsi/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/adm/provinsi/${id}`, { method: 'DELETE' })
  },
}

export const admKabupatenKotaService = {
  list(params?: {
    q?: string
    provinsi_id?: number
    jenis?: string
    page?: number
    per_page?: number
  }) {
    return apiRequest<Paginated<AdmKabupatenKota>>(
      `/master/adm/kabupaten-kota${buildListQuery([
        ['q', params?.q],
        ['provinsi_id', params?.provinsi_id],
        ['jenis', params?.jenis],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<AdmKabupatenKota>(`/master/adm/kabupaten-kota/${id}`)
  },
  create(data: AdmKabupatenKotaInput) {
    return apiRequest<AdmKabupatenKota>('/master/adm/kabupaten-kota', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<AdmKabupatenKotaInput>) {
    return apiRequest<AdmKabupatenKota>(`/master/adm/kabupaten-kota/${id}`, {
      method: 'PUT',
      body: data,
    })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/adm/kabupaten-kota/${id}`, { method: 'DELETE' })
  },
}

export const admKecamatanService = {
  list(params?: { q?: string; kabupaten_kota_id?: number; page?: number; per_page?: number }) {
    return apiRequest<Paginated<AdmKecamatan>>(
      `/master/adm/kecamatan${buildListQuery([
        ['q', params?.q],
        ['kabupaten_kota_id', params?.kabupaten_kota_id],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<AdmKecamatan>(`/master/adm/kecamatan/${id}`)
  },
  create(data: AdmKecamatanInput) {
    return apiRequest<AdmKecamatan>('/master/adm/kecamatan', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<AdmKecamatanInput>) {
    return apiRequest<AdmKecamatan>(`/master/adm/kecamatan/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/adm/kecamatan/${id}`, { method: 'DELETE' })
  },
}

export const admDesaKelurahanService = {
  list(params?: {
    q?: string
    kecamatan_id?: number
    jenis?: string
    page?: number
    per_page?: number
  }) {
    return apiRequest<Paginated<AdmDesaKelurahan>>(
      `/master/adm/desa-kelurahan${buildListQuery([
        ['q', params?.q],
        ['kecamatan_id', params?.kecamatan_id],
        ['jenis', params?.jenis],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<AdmDesaKelurahan>(`/master/adm/desa-kelurahan/${id}`)
  },
  create(data: AdmDesaKelurahanInput) {
    return apiRequest<AdmDesaKelurahan>('/master/adm/desa-kelurahan', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<AdmDesaKelurahanInput>) {
    return apiRequest<AdmDesaKelurahan>(`/master/adm/desa-kelurahan/${id}`, {
      method: 'PUT',
      body: data,
    })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/adm/desa-kelurahan/${id}`, { method: 'DELETE' })
  },
}

export const admKodePosService = {
  list(params?: {
    q?: string
    desa_kelurahan_id?: number
    kecamatan_id?: number
    page?: number
    per_page?: number
  }) {
    return apiRequest<Paginated<AdmKodePos>>(
      `/master/adm/kode-pos${buildListQuery([
        ['q', params?.q],
        ['desa_kelurahan_id', params?.desa_kelurahan_id],
        ['kecamatan_id', params?.kecamatan_id],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<AdmKodePos>(`/master/adm/kode-pos/${id}`)
  },
  create(data: AdmKodePosInput) {
    return apiRequest<AdmKodePos>('/master/adm/kode-pos', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<AdmKodePosInput>) {
    return apiRequest<AdmKodePos>(`/master/adm/kode-pos/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/adm/kode-pos/${id}`, { method: 'DELETE' })
  },
}

export const masterDapukanService = {
  list(params?: { q?: string; page?: number; per_page?: number }) {
    return apiRequest<Paginated<Dapukan>>(
      `/master/dapukan${buildListQuery([
        ['q', params?.q],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<Dapukan>(`/master/dapukan/${id}`)
  },
  create(data: DapukanInput) {
    return apiRequest<Dapukan>('/master/dapukan', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<DapukanInput>) {
    return apiRequest<Dapukan>(`/master/dapukan/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/dapukan/${id}`, { method: 'DELETE' })
  },
}

export const masterMenuService = {
  list(params?: { q?: string; page?: number; per_page?: number }) {
    return apiRequest<Paginated<Menu>>(
      `/master/menus${buildListQuery([
        ['q', params?.q],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<Menu>(`/master/menus/${id}`)
  },
  create(data: MenuInput) {
    return apiRequest<Menu>('/master/menus', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<MenuInput>) {
    return apiRequest<Menu>(`/master/menus/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/menus/${id}`, { method: 'DELETE' })
  },
}

export const masterFiturService = {
  list(params?: { q?: string; menu_id?: number; page?: number; per_page?: number }) {
    return apiRequest<Paginated<Fitur>>(
      `/master/fiturs${buildListQuery([
        ['q', params?.q],
        ['menu_id', params?.menu_id],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<Fitur>(`/master/fiturs/${id}`)
  },
  create(data: FiturInput) {
    return apiRequest<Fitur>('/master/fiturs', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<FiturInput>) {
    return apiRequest<Fitur>(`/master/fiturs/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/fiturs/${id}`, { method: 'DELETE' })
  },
}

export const masterHakAksesService = {
  list(params?: { q?: string; fitur_id?: number; page?: number; per_page?: number }) {
    return apiRequest<Paginated<HakAkses>>(
      `/master/hak-akses${buildListQuery([
        ['q', params?.q],
        ['fitur_id', params?.fitur_id],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<HakAkses>(`/master/hak-akses/${id}`)
  },
  create(data: HakAksesInput) {
    return apiRequest<HakAkses>('/master/hak-akses', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<HakAksesInput>) {
    return apiRequest<HakAkses>(`/master/hak-akses/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/hak-akses/${id}`, { method: 'DELETE' })
  },
}

export const masterMatriksService = {
  get() {
    return apiRequest<MatriksData>('/master/matriks')
  },
  update(dapukanId: number, hakAksesIds: number[]) {
    return apiRequest<Dapukan>(`/master/matriks/${dapukanId}`, {
      method: 'PUT',
      body: { hak_akses_ids: hakAksesIds },
    })
  },
}

export const masterUserService = {
  list(params?: {
    q?: string
    is_active?: boolean
    dapukan_id?: number
    page?: number
    per_page?: number
  }) {
    return apiRequest<Paginated<MasterUser>>(
      `/master/users${buildListQuery([
        ['q', params?.q],
        ['is_active', params?.is_active],
        ['dapukan_id', params?.dapukan_id],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<MasterUser>(`/master/users/${id}`)
  },
  create(data: MasterUserInput & { password: string }) {
    return apiRequest<MasterUser>('/master/users', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<MasterUserInput>) {
    return apiRequest<MasterUser>(`/master/users/${id}`, { method: 'PUT', body: data })
  },
  deactivate(id: number) {
    return apiRequest<MasterUser>(`/master/users/${id}/deactivate`, { method: 'POST' })
  },
}

export const dashboardService = {
  getStats() {
    return apiRequest<DashboardStats>('/dashboard')
  },
  getAbsensiOverview(params: { from: string; to: string }) {
    return apiRequest<AbsensiOverviewPeriod>(
      `/dashboard/absensi-overview${buildListQuery([
        ['from', params.from],
        ['to', params.to],
      ])}`,
    )
  },
}

export const kategoriUmurService = {
  summary(params?: { kategori?: string }) {
    return apiRequest<KategoriUmurSummary>(
      `/kategori-umur${buildListQuery([['kategori', params?.kategori]])}`,
    )
  },
}

export const jamaahService = {
  list(params?: {
    q?: string
    enrolled?: boolean
    status?: string
    kelompok_id?: number
    face?: string
    kategori_umur?: string
    page?: number
    per_page?: number
  }) {
    return apiRequest<Paginated<Jamaah>>(
      `/jamaah${buildListQuery([
        ['q', params?.q],
        ['enrolled', params?.enrolled],
        ['status', params?.status],
        ['kelompok_id', params?.kelompok_id],
        ['face', params?.face],
        ['kategori_umur', params?.kategori_umur],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<Jamaah>(`/jamaah/${id}`)
  },
  dapukanOptions() {
    return apiRequest<JamaahDapukanOption[]>('/jamaah/dapukan-options')
  },
  kelompokOptions() {
    return apiRequest<Kelompok[]>('/jamaah/kelompok-options')
  },
  create(data: JamaahInput) {
    return apiRequest<Jamaah>('/jamaah', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<JamaahInput>) {
    return apiRequest<Jamaah>(`/jamaah/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/jamaah/${id}`, { method: 'DELETE' })
  },
  enrollFace(id: number, faceDescriptor: number[]) {
    return apiRequest<Jamaah>(`/jamaah/${id}/face`, {
      method: 'POST',
      body: { face_descriptor: faceDescriptor },
    })
  },
  resetFace(id: number) {
    return apiRequest<Jamaah>(`/jamaah/${id}/face`, { method: 'DELETE' })
  },
}

export const pengajianService = {
  list(params?: {
    q?: string
    status?: string
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
  }) {
    return apiRequest<Paginated<Pengajian>>(
      `/pengajian${buildListQuery([
        ['q', params?.q],
        ['status', params?.status],
        ['date_from', params?.date_from],
        ['date_to', params?.date_to],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<Pengajian>(`/pengajian/${id}`)
  },
  create(data: PengajianInput) {
    return apiRequest<Pengajian>('/pengajian', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<PengajianInput>) {
    return apiRequest<Pengajian>(`/pengajian/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/pengajian/${id}`, { method: 'DELETE' })
  },
}

export const kegiatanService = {
  list(params?: {
    q?: string
    status?: string
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
  }) {
    return apiRequest<Paginated<Kegiatan>>(
      `/kegiatan${buildListQuery([
        ['q', params?.q],
        ['status', params?.status],
        ['date_from', params?.date_from],
        ['date_to', params?.date_to],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  get(id: number) {
    return apiRequest<Kegiatan>(`/kegiatan/${id}`)
  },
  create(data: KegiatanInput) {
    return apiRequest<Kegiatan>('/kegiatan', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<KegiatanInput>) {
    return apiRequest<Kegiatan>(`/kegiatan/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/kegiatan/${id}`, { method: 'DELETE' })
  },
}

export const attendanceService = {
  listSessions(params?: { status?: string; page?: number; per_page?: number }) {
    return apiRequest<Paginated<AttendanceSession>>(
      `/attendance/sessions${buildListQuery([
        ['status', params?.status],
        ['page', params?.page],
        ['per_page', params?.per_page],
      ])}`,
    )
  },
  getSession(id: number) {
    return apiRequest<AttendanceSession>(`/attendance/sessions/${id}`)
  },
  openSession(data: OpenSessionInput) {
    return apiRequest<AttendanceSession>('/attendance/sessions', {
      method: 'POST',
      body: data,
    })
  },
  closeSession(id: number) {
    return apiRequest<AttendanceSession>(`/attendance/sessions/${id}/close`, {
      method: 'POST',
    })
  },
  checkIn(sessionId: number, data: CheckInInput) {
    return apiRequest<unknown>(`/attendance/sessions/${sessionId}/check-in`, {
      method: 'POST',
      body: data,
    })
  },
}

export const calendarService = {
  month(params?: { year?: number; month?: number }) {
    return apiRequest<CalendarMonth>(
      `/calendar${buildListQuery([
        ['year', params?.year],
        ['month', params?.month],
      ])}`,
    )
  },
}
