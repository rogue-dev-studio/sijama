import { apiRequest, apiUploadRequest } from './client'
import type { KonfigAssetKind } from '../lib/konfigAsset'
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
  AppPublicSettings,
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
  KategoriUmurList,
  Kegiatan,
  KegiatanInput,
  KegiatanJadwalRutin,
  KegiatanJadwalRutinInput,
  Keluarga,
  KeluargaInput,
  KeluargaJamaahOption,
  Kelompok,
  KelompokInput,
  KonfigSystem,
  KonfigSystemInput,
  HariLiburSyncResponse,
  IntegrationCheckResult,
  IntegrationExpirySweepResult,
  IntegrationLogInput,
  IntegrationLogRow,
  KonfigDokumen,
  KonfigDokumenInput,
  KonfigDokumenAssetKind,
  LaporanKehadiranRow,
  AuditLoginRow,
  AppErrorLogRow,
  AuditActivityRow,
  AppReportRow,
  AppReportInput,
  AppReportAdminUpdateInput,
  AppReportCategory,
  AppFeedbackRow,
  AppFeedbackIdeaInput,
  AppFeedbackTestimonialInput,
  AppFeedbackAdminUpdateInput,
  AppPollRow,
  AppPollVoteInput,
  AppPollAdminInput,
  LoginInput,
  LoginResult,
  ForgotPasswordInput,
  ForgotPasswordResult,
  ResetPasswordInput,
  Lokasi,
  LokasiInput,
  LookupM,
  LookupMInput,
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
  OwnLoginSessionInput,
  OwnPasswordInput,
  OwnProfileInput,
  LookupOption,
  Paginated,
  Pemateri,
  PemateriInput,
  ProfileResult,
  ProfileWilayahOption,
  WilayahFromNikResult,
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

function withSort(
  entries: Array<[string, ListQueryValue]>,
  params?: { sort_by?: string; sort_dir?: string },
): Array<[string, ListQueryValue]> {
  return [...entries, ['sort_by', params?.sort_by], ['sort_dir', params?.sort_dir]]
}

export const authService = {
  login(data: LoginInput) {
    return apiRequest<LoginResult>('/login', {
      method: 'POST',
      body: data,
      auth: false,
    })
  },
  forgotPassword(data: ForgotPasswordInput) {
    return apiRequest<ForgotPasswordResult>('/forgot-password', {
      method: 'POST',
      body: data,
      auth: false,
    })
  },
  resetPassword(data: ResetPasswordInput) {
    return apiRequest<null>('/reset-password', {
      method: 'POST',
      body: data,
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
  wilayahFromNik(nik: string) {
    return apiRequest<WilayahFromNikResult>(
      `/profile/wilayah-from-nik${buildListQuery([['nik', nik]])}`,
    )
  },
  updatePassword(data: OwnPasswordInput) {
    return apiRequest<null>('/profile/password', { method: 'PUT', body: data })
  },
  updateLoginSession(data: OwnLoginSessionInput) {
    return apiRequest<ProfileResult>('/profile/login-session', { method: 'PUT', body: data })
  },
  uploadPhoto(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return apiUploadRequest<ProfileResult>('/profile/photo', formData)
  },
  deletePhoto() {
    return apiRequest<ProfileResult>('/profile/photo', { method: 'DELETE' })
  },
  uploadSignature(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return apiUploadRequest<ProfileResult>('/profile/signature', formData)
  },
  deleteSignature() {
    return apiRequest<ProfileResult>('/profile/signature', { method: 'DELETE' })
  },
}

export const masterPusatService = {
  list(params?: {
    q?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<Pusat>>(
      `/master/wilayah-fung/pusat${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  get(id: number) {
    return apiRequest<Pusat>(`/master/wilayah-fung/pusat/${id}`)
  },
  create(data: PusatInput) {
    return apiRequest<Pusat>('/master/wilayah-fung/pusat', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<PusatInput>) {
    return apiRequest<Pusat>(`/master/wilayah-fung/pusat/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/wilayah-fung/pusat/${id}`, { method: 'DELETE' })
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
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<Lokasi>>(
      `/master/lokasi${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['jenis', params?.jenis],
            ['active_only', params?.active_only],
            ['is_active', params?.is_active],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
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
  resolveCoords(lat: number, lng: number) {
    return apiRequest<MapsLocationResolveResult>('/master/lokasi/resolve-coords', {
      method: 'POST',
      body: { lat, lng },
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
  list(params?: {
    q?: string
    active_only?: boolean
    is_active?: boolean
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<Pemateri>>(
      `/master/pemateri${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['active_only', params?.active_only],
            ['is_active', params?.is_active],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
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

export const lookupOptionsService = {
  byTypes(types: string[]) {
    return apiRequest<Record<string, LookupOption[]>>(
      `/lookups/options${buildListQuery([['types', types.join(',')]])}`,
    )
  },
}

export const masterLookupService = {
  list(params?: {
    q?: string
    lookup_type?: string
    active_only?: boolean
    is_active?: boolean
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<LookupM>>(
      `/master/lookup${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['lookup_type', params?.lookup_type],
            ['active_only', params?.active_only],
            ['is_active', params?.is_active],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  get(id: number) {
    return apiRequest<LookupM>(`/master/lookup/${id}`)
  },
  create(data: LookupMInput) {
    return apiRequest<LookupM>('/master/lookup', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<LookupMInput>) {
    return apiRequest<LookupM>(`/master/lookup/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/lookup/${id}`, { method: 'DELETE' })
  },
}

export const aplikasiKonfigService = {
  get() {
    return apiRequest<KonfigSystem>('/aplikasi/konfig')
  },
  update(data: Partial<KonfigSystemInput>) {
    return apiRequest<KonfigSystem>('/aplikasi/konfig', { method: 'PUT', body: data })
  },
  uploadAsset(asset: KonfigAssetKind, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return apiUploadRequest<KonfigSystem>(`/aplikasi/konfig/assets/${asset}`, formData)
  },
  deleteAsset(asset: KonfigAssetKind) {
    return apiRequest<KonfigSystem>(`/aplikasi/konfig/assets/${asset}`, { method: 'DELETE' })
  },
  publicSettings() {
    return apiRequest<AppPublicSettings>('/public/konfig')
  },
  syncHariLibur(data?: { year?: number; next?: boolean }) {
    return apiRequest<HariLiburSyncResponse>('/aplikasi/konfig/hari-libur/sync', {
      method: 'POST',
      body: data ?? {},
    })
  },
  listIntegrationLogs(params?: {
    q?: string
    provider?: string
    level?: string
    event_type?: string
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<IntegrationLogRow>>(
      `/aplikasi/konfig/integration-logs${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['provider', params?.provider],
            ['level', params?.level],
            ['event_type', params?.event_type],
            ['date_from', params?.date_from],
            ['date_to', params?.date_to],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  showIntegrationLog(id: number) {
    return apiRequest<IntegrationLogRow>(`/aplikasi/konfig/integration-logs/${id}`)
  },
  createIntegrationLog(data: IntegrationLogInput) {
    return apiRequest<IntegrationLogRow>('/aplikasi/konfig/integration-logs', {
      method: 'POST',
      body: data,
    })
  },
  checkIntegration(provider: string) {
    return apiRequest<IntegrationCheckResult>(`/aplikasi/konfig/integrations/${provider}/check`, {
      method: 'POST',
    })
  },
  sweepIntegrationExpiry() {
    return apiRequest<IntegrationExpirySweepResult>('/aplikasi/konfig/integrations/expiry-sweep', {
      method: 'POST',
    })
  },
}

export const aplikasiKonfigDokumenService = {
  list(params?: {
    q?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<KonfigDokumen>>(
      `/aplikasi/konfig-dokumen${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  get(lookupId: number) {
    return apiRequest<KonfigDokumen>(`/aplikasi/konfig-dokumen/${lookupId}`)
  },
  update(data: Partial<KonfigDokumenInput> & { lookup_id: number }) {
    return apiRequest<KonfigDokumen>('/aplikasi/konfig-dokumen', { method: 'PUT', body: data })
  },
  uploadAsset(lookupId: number, asset: KonfigDokumenAssetKind, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return apiUploadRequest<KonfigDokumen>(`/aplikasi/konfig-dokumen/${lookupId}/assets/${asset}`, formData)
  },
  deleteAsset(lookupId: number, asset: KonfigDokumenAssetKind) {
    return apiRequest<KonfigDokumen>(`/aplikasi/konfig-dokumen/${lookupId}/assets/${asset}`, {
      method: 'DELETE',
    })
  },
}

export const masterMateriService = {
  list(params?: {
    q?: string
    active_only?: boolean
    is_active?: boolean
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<Materi>>(
      `/master/materi${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['active_only', params?.active_only],
            ['is_active', params?.is_active],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
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
  list(params?: {
    q?: string
    active_only?: boolean
    is_active?: boolean
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<KategoriKegiatan>>(
      `/master/kategori-kegiatan${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['active_only', params?.active_only],
            ['is_active', params?.is_active],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
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
  list(params?: {
    q?: string
    wilayah_fung_pusat_id?: number
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<Daerah>>(
      `/master/wilayah-fung/daerah${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['wilayah_fung_pusat_id', params?.wilayah_fung_pusat_id],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  get(id: number) {
    return apiRequest<Daerah>(`/master/wilayah-fung/daerah/${id}`)
  },
  create(data: DaerahInput) {
    return apiRequest<Daerah>('/master/wilayah-fung/daerah', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<DaerahInput>) {
    return apiRequest<Daerah>(`/master/wilayah-fung/daerah/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/wilayah-fung/daerah/${id}`, { method: 'DELETE' })
  },
}

export const masterDesaService = {
  list(params?: {
    q?: string
    wilayah_fung_daerah_id?: number
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<Desa>>(
      `/master/wilayah-fung/desa${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['wilayah_fung_daerah_id', params?.wilayah_fung_daerah_id],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  get(id: number) {
    return apiRequest<Desa>(`/master/wilayah-fung/desa/${id}`)
  },
  create(data: DesaInput) {
    return apiRequest<Desa>('/master/wilayah-fung/desa', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<DesaInput>) {
    return apiRequest<Desa>(`/master/wilayah-fung/desa/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/wilayah-fung/desa/${id}`, { method: 'DELETE' })
  },
}

export const masterKelompokService = {
  list(params?: {
    q?: string
    wilayah_fung_desa_id?: number
    wilayah_fung_daerah_id?: number
    is_active?: boolean
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<Kelompok>>(
      `/master/wilayah-fung/kelompok${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['wilayah_fung_desa_id', params?.wilayah_fung_desa_id],
            ['wilayah_fung_daerah_id', params?.wilayah_fung_daerah_id],
            ['is_active', params?.is_active],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  get(id: number) {
    return apiRequest<Kelompok>(`/master/wilayah-fung/kelompok/${id}`)
  },
  create(data: KelompokInput) {
    return apiRequest<Kelompok>('/master/wilayah-fung/kelompok', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<KelompokInput>) {
    return apiRequest<Kelompok>(`/master/wilayah-fung/kelompok/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/wilayah-fung/kelompok/${id}`, { method: 'DELETE' })
  },
}

export const masterSubKelompokService = {
  list(params?: {
    q?: string
    wilayah_fung_kelompok_id?: number
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<SubKelompok>>(
      `/master/wilayah-fung/sub-kelompok${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['wilayah_fung_kelompok_id', params?.wilayah_fung_kelompok_id],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  get(id: number) {
    return apiRequest<SubKelompok>(`/master/wilayah-fung/sub-kelompok/${id}`)
  },
  create(data: SubKelompokInput) {
    return apiRequest<SubKelompok>('/master/wilayah-fung/sub-kelompok', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<SubKelompokInput>) {
    return apiRequest<SubKelompok>(`/master/wilayah-fung/sub-kelompok/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/wilayah-fung/sub-kelompok/${id}`, { method: 'DELETE' })
  },
}

export const admNegaraService = {
  list(params?: {
    q?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<AdmNegara>>(
      `/master/wilayah-adm/negara${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  get(id: number) {
    return apiRequest<AdmNegara>(`/master/wilayah-adm/negara/${id}`)
  },
  create(data: AdmNegaraInput) {
    return apiRequest<AdmNegara>('/master/wilayah-adm/negara', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<AdmNegaraInput>) {
    return apiRequest<AdmNegara>(`/master/wilayah-adm/negara/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/wilayah-adm/negara/${id}`, { method: 'DELETE' })
  },
}

export const admProvinsiService = {
  list(params?: {
    q?: string
    wilayah_adm_negara_id?: number
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<AdmProvinsi>>(
      `/master/wilayah-adm/provinsi${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['wilayah_adm_negara_id', params?.wilayah_adm_negara_id],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  get(id: number) {
    return apiRequest<AdmProvinsi>(`/master/wilayah-adm/provinsi/${id}`)
  },
  create(data: AdmProvinsiInput) {
    return apiRequest<AdmProvinsi>('/master/wilayah-adm/provinsi', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<AdmProvinsiInput>) {
    return apiRequest<AdmProvinsi>(`/master/wilayah-adm/provinsi/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/wilayah-adm/provinsi/${id}`, { method: 'DELETE' })
  },
}

export const admKabupatenKotaService = {
  list(params?: {
    q?: string
    wilayah_adm_provinsi_id?: number
    jenis?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<AdmKabupatenKota>>(
      `/master/wilayah-adm/kabupaten-kota${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['wilayah_adm_provinsi_id', params?.wilayah_adm_provinsi_id],
            ['jenis', params?.jenis],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  get(id: number) {
    return apiRequest<AdmKabupatenKota>(`/master/wilayah-adm/kabupaten-kota/${id}`)
  },
  create(data: AdmKabupatenKotaInput) {
    return apiRequest<AdmKabupatenKota>('/master/wilayah-adm/kabupaten-kota', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<AdmKabupatenKotaInput>) {
    return apiRequest<AdmKabupatenKota>(`/master/wilayah-adm/kabupaten-kota/${id}`, {
      method: 'PUT',
      body: data,
    })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/wilayah-adm/kabupaten-kota/${id}`, { method: 'DELETE' })
  },
}

export const admKecamatanService = {
  list(params?: {
    q?: string
    wilayah_adm_kabupaten_kota_id?: number
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<AdmKecamatan>>(
      `/master/wilayah-adm/kecamatan${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['wilayah_adm_kabupaten_kota_id', params?.wilayah_adm_kabupaten_kota_id],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  get(id: number) {
    return apiRequest<AdmKecamatan>(`/master/wilayah-adm/kecamatan/${id}`)
  },
  create(data: AdmKecamatanInput) {
    return apiRequest<AdmKecamatan>('/master/wilayah-adm/kecamatan', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<AdmKecamatanInput>) {
    return apiRequest<AdmKecamatan>(`/master/wilayah-adm/kecamatan/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/wilayah-adm/kecamatan/${id}`, { method: 'DELETE' })
  },
}

export const admDesaKelurahanService = {
  list(params?: {
    q?: string
    wilayah_adm_kecamatan_id?: number
    jenis?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<AdmDesaKelurahan>>(
      `/master/wilayah-adm/desa${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['wilayah_adm_kecamatan_id', params?.wilayah_adm_kecamatan_id],
            ['jenis', params?.jenis],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  get(id: number) {
    return apiRequest<AdmDesaKelurahan>(`/master/wilayah-adm/desa/${id}`)
  },
  create(data: AdmDesaKelurahanInput) {
    return apiRequest<AdmDesaKelurahan>('/master/wilayah-adm/desa', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<AdmDesaKelurahanInput>) {
    return apiRequest<AdmDesaKelurahan>(`/master/wilayah-adm/desa/${id}`, {
      method: 'PUT',
      body: data,
    })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/wilayah-adm/desa/${id}`, { method: 'DELETE' })
  },
}

export const admKodePosService = {
  list(params?: {
    q?: string
    wilayah_adm_desa_id?: number
    wilayah_adm_kecamatan_id?: number
    wilayah_adm_kabupaten_kota_id?: number
    wilayah_adm_provinsi_id?: number
    wilayah_adm_negara_id?: number
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<AdmKodePos>>(
      `/master/wilayah-adm/kode-pos${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['wilayah_adm_desa_id', params?.wilayah_adm_desa_id],
            ['wilayah_adm_kecamatan_id', params?.wilayah_adm_kecamatan_id],
            ['wilayah_adm_kabupaten_kota_id', params?.wilayah_adm_kabupaten_kota_id],
            ['wilayah_adm_provinsi_id', params?.wilayah_adm_provinsi_id],
            ['wilayah_adm_negara_id', params?.wilayah_adm_negara_id],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  get(id: number) {
    return apiRequest<AdmKodePos>(`/master/wilayah-adm/kode-pos/${id}`)
  },
  create(data: AdmKodePosInput) {
    return apiRequest<AdmKodePos>('/master/wilayah-adm/kode-pos', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<AdmKodePosInput>) {
    return apiRequest<AdmKodePos>(`/master/wilayah-adm/kode-pos/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/master/wilayah-adm/kode-pos/${id}`, { method: 'DELETE' })
  },
}

export const masterDapukanService = {
  list(params?: {
    q?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<Dapukan>>(
      `/master/dapukan${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
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
  list(params?: {
    q?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<Menu>>(
      `/master/menus${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
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
  list(params?: {
    q?: string
    menu_id?: number
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<Fitur>>(
      `/master/fiturs${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['menu_id', params?.menu_id],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
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
  list(params?: {
    q?: string
    fitur_id?: number
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<HakAkses>>(
      `/master/hak-akses${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['fitur_id', params?.fitur_id],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
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
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<MasterUser>>(
      `/master/users${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['is_active', params?.is_active],
            ['dapukan_id', params?.dapukan_id],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
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
  list(params?: {
    kategori?: string
    q?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<KategoriUmurList>(
      `/kategori-umur${buildListQuery(
        withSort(
          [
            ['kategori', params?.kategori],
            ['q', params?.q],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
}

export const jamaahService = {
  list(params?: {
    q?: string
    enrolled?: boolean
    status?: string
    wilayah_fung_kelompok_id?: number
    face?: string
    kategori_umur?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<Jamaah>>(
      `/jamaah${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['enrolled', params?.enrolled],
            ['status', params?.status],
            ['wilayah_fung_kelompok_id', params?.wilayah_fung_kelompok_id],
            ['face', params?.face],
            ['kategori_umur', params?.kategori_umur],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
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

export const keluargaService = {
  list(params?: {
    q?: string
    status?: string
    wilayah_fung_kelompok_id?: number
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<Keluarga>>(
      `/keluarga${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['status', params?.status],
            ['wilayah_fung_kelompok_id', params?.wilayah_fung_kelompok_id],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  get(id: number) {
    return apiRequest<Keluarga>(`/keluarga/${id}`)
  },
  jamaahOptions(params?: { wilayah_fung_kelompok_id?: number; except_keluarga_id?: number }) {
    return apiRequest<KeluargaJamaahOption[]>(
      `/keluarga/jamaah-options${buildListQuery([
        ['wilayah_fung_kelompok_id', params?.wilayah_fung_kelompok_id],
        ['except_keluarga_id', params?.except_keluarga_id],
      ])}`,
    )
  },
  create(data: KeluargaInput) {
    return apiRequest<Keluarga>('/keluarga', { method: 'POST', body: data })
  },
  update(id: number, data: KeluargaInput) {
    return apiRequest<Keluarga>(`/keluarga/${id}`, { method: 'PUT', body: data })
  },
  remove(id: number) {
    return apiRequest<null>(`/keluarga/${id}`, { method: 'DELETE' })
  },
}

export const kegiatanService = {
  list(params?: {
    q?: string
    status?: string
    kategori_kegiatan_id?: number
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<Kegiatan>>(
      `/kegiatan${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['status', params?.status],
            ['kategori_kegiatan_id', params?.kategori_kegiatan_id],
            ['date_from', params?.date_from],
            ['date_to', params?.date_to],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
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

export const kegiatanJadwalRutinService = {
  list(params?: {
    q?: string
    is_active?: boolean
    scope_level?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<KegiatanJadwalRutin>>(
      `/kegiatan-jadwal-rutin${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['is_active', params?.is_active],
            ['scope_level', params?.scope_level],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  get(id: number) {
    return apiRequest<KegiatanJadwalRutin>(`/kegiatan-jadwal-rutin/${id}`)
  },
  create(data: KegiatanJadwalRutinInput) {
    return apiRequest<KegiatanJadwalRutin>('/kegiatan-jadwal-rutin', { method: 'POST', body: data })
  },
  update(id: number, data: Partial<KegiatanJadwalRutinInput>) {
    return apiRequest<KegiatanJadwalRutin>(`/kegiatan-jadwal-rutin/${id}`, { method: 'PUT', body: data })
  },
  deactivate(id: number) {
    return apiRequest<KegiatanJadwalRutin>(`/kegiatan-jadwal-rutin/${id}/deactivate`, { method: 'POST' })
  },
  generate(id: number) {
    return apiRequest<{ created: number; jadwal: KegiatanJadwalRutin }>(
      `/kegiatan-jadwal-rutin/${id}/generate`,
      { method: 'POST' },
    )
  },
}

export const attendanceService = {
  listSessions(params?: {
    status?: string
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<AttendanceSession>>(
      `/attendance/sessions${buildListQuery(
        withSort(
          [
            ['status', params?.status],
            ['date_from', params?.date_from],
            ['date_to', params?.date_to],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
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

export const laporanService = {
  kehadiran(params?: {
    q?: string
    date_from?: string
    date_to?: string
    type?: string
    method?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<LaporanKehadiranRow>>(
      `/laporan/kehadiran${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['date_from', params?.date_from],
            ['date_to', params?.date_to],
            ['type', params?.type],
            ['method', params?.method],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  jamaah(params?: {
    q?: string
    status?: string
    face?: string
    wilayah_fung_kelompok_id?: number
    kategori_umur?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<Jamaah>>(
      `/laporan/jamaah${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['status', params?.status],
            ['face', params?.face],
            ['wilayah_fung_kelompok_id', params?.wilayah_fung_kelompok_id],
            ['kategori_umur', params?.kategori_umur],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  kegiatan(params?: {
    q?: string
    status?: string
    kategori_kegiatan_id?: number
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<Kegiatan>>(
      `/laporan/kegiatan${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['status', params?.status],
            ['kategori_kegiatan_id', params?.kategori_kegiatan_id],
            ['date_from', params?.date_from],
            ['date_to', params?.date_to],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
}

export const auditLoginService = {
  list(params?: {
    q?: string
    event?: string
    success?: string
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<AuditLoginRow>>(
      `/aplikasi/audit/login${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['event', params?.event],
            ['success', params?.success],
            ['date_from', params?.date_from],
            ['date_to', params?.date_to],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
}

export const appErrorLogService = {
  list(params?: {
    q?: string
    level?: string
    status?: string
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<AppErrorLogRow>>(
      `/aplikasi/log/error${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['level', params?.level],
            ['status', params?.status],
            ['date_from', params?.date_from],
            ['date_to', params?.date_to],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  show(id: number) {
    return apiRequest<AppErrorLogRow>(`/aplikasi/log/error/${id}`)
  },
  updateStatus(id: number, data: { status: string; status_note?: string | null }) {
    return apiRequest<AppErrorLogRow>(`/aplikasi/log/error/${id}`, {
      method: 'PATCH',
      body: data,
    })
  },
  clear(params?: { level?: string; status?: string; date_from?: string; date_to?: string }) {
    return apiRequest<{ deleted: number }>(
      `/aplikasi/log/error${buildListQuery([
        ['level', params?.level],
        ['status', params?.status],
        ['date_from', params?.date_from],
        ['date_to', params?.date_to],
      ])}`,
      { method: 'DELETE' },
    )
  },
}

export const auditActivityService = {
  list(
    module: 'access' | 'konfig' | 'jamaah',
    params?: {
      q?: string
      action?: string
      date_from?: string
      date_to?: string
      page?: number
      per_page?: number
      sort_by?: string
      sort_dir?: 'asc' | 'desc'
    },
  ) {
    const path =
      module === 'access'
        ? '/aplikasi/audit/akses'
        : module === 'konfig'
          ? '/aplikasi/audit/konfig'
          : '/aplikasi/audit/jamaah'

    return apiRequest<Paginated<AuditActivityRow>>(
      `${path}${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['action', params?.action],
            ['date_from', params?.date_from],
            ['date_to', params?.date_to],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  show(module: 'access' | 'konfig' | 'jamaah', id: number) {
    const path =
      module === 'access'
        ? '/aplikasi/audit/akses'
        : module === 'konfig'
          ? '/aplikasi/audit/konfig'
          : '/aplikasi/audit/jamaah'

    return apiRequest<AuditActivityRow>(`${path}/${id}`)
  },
}

export const appReportService = {
  create(category: AppReportCategory, data: FormData | AppReportInput) {
    if (data instanceof FormData) {
      return apiUploadRequest<AppReportRow>(`/aplikasi/laporkan/${category}`, data)
    }
    return apiUploadRequest<AppReportRow>(`/aplikasi/laporkan/${category}`, (() => {
      const formData = new FormData()
      formData.append('reporter_name', data.reporter_name)
      formData.append('subject', data.subject)
      formData.append('description', data.description)
      if (data.contact) formData.append('contact', data.contact)
      return formData
    })())
  },
  mine(params?: {
    q?: string
    category?: string
    status?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<AppReportRow>>(
      `/aplikasi/laporkan/saya${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['category', params?.category],
            ['status', params?.status],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  adminList(params?: {
    q?: string
    category?: string
    status?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<AppReportRow>>(
      `/aplikasi/laporkan/informasi${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['category', params?.category],
            ['status', params?.status],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  adminUpdate(id: number, data: AppReportAdminUpdateInput) {
    return apiRequest<AppReportRow>(`/aplikasi/laporkan/informasi/${id}`, {
      method: 'PATCH',
      body: data,
    })
  },
}

export const appFeedbackService = {
  createIdea(data: FormData | AppFeedbackIdeaInput) {
    if (data instanceof FormData) {
      return apiUploadRequest<AppFeedbackRow>('/aplikasi/kotak-masukan/ide', data)
    }
    const formData = new FormData()
    formData.append('reporter_name', data.reporter_name)
    formData.append('title', data.title)
    formData.append('body', data.body)
    if (data.contact) formData.append('contact', data.contact)
    return apiUploadRequest<AppFeedbackRow>('/aplikasi/kotak-masukan/ide', formData)
  },
  createTestimonial(data: FormData | AppFeedbackTestimonialInput) {
    if (data instanceof FormData) {
      return apiUploadRequest<AppFeedbackRow>('/aplikasi/kotak-masukan/testimoni', data)
    }
    const formData = new FormData()
    formData.append('reporter_name', data.reporter_name)
    formData.append('title', data.title)
    formData.append('body', data.body)
    formData.append('rating', String(data.rating))
    if (data.role_label) formData.append('role_label', data.role_label)
    if (data.contact) formData.append('contact', data.contact)
    return apiUploadRequest<AppFeedbackRow>('/aplikasi/kotak-masukan/testimoni', formData)
  },
  gallery() {
    return apiRequest<AppFeedbackRow[]>('/aplikasi/kotak-masukan/galeri-testimoni')
  },
  mineIdeas(params?: {
    q?: string
    status?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<AppFeedbackRow>>(
      `/aplikasi/kotak-masukan/ide/saya${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['status', params?.status],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  adminList(params?: {
    q?: string
    kind?: string
    status?: string
    is_published?: string | boolean
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<AppFeedbackRow>>(
      `/aplikasi/kotak-masukan/informasi${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['kind', params?.kind],
            ['status', params?.status],
            ['is_published', params?.is_published],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  adminUpdate(id: number, data: AppFeedbackAdminUpdateInput) {
    return apiRequest<AppFeedbackRow>(`/aplikasi/kotak-masukan/informasi/${id}`, {
      method: 'PATCH',
      body: data,
    })
  },
  testimonialAdminList(params?: {
    q?: string
    is_published?: string | boolean
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<AppFeedbackRow>>(
      `/aplikasi/kotak-masukan/daftar-testimoni${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['is_published', params?.is_published],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  testimonialAdminUpdate(id: number, data: { is_published: boolean }) {
    return apiRequest<AppFeedbackRow>(`/aplikasi/kotak-masukan/daftar-testimoni/${id}`, {
      method: 'PATCH',
      body: data,
    })
  },
}

export const appPollService = {
  active() {
    return apiRequest<AppPollRow[]>('/aplikasi/kotak-masukan/polling')
  },
  vote(id: number, data: AppPollVoteInput) {
    return apiRequest<AppPollRow>(`/aplikasi/kotak-masukan/polling/${id}/vote`, {
      method: 'POST',
      body: data,
    })
  },
  adminList(params?: {
    q?: string
    is_active?: string | boolean
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    return apiRequest<Paginated<AppPollRow>>(
      `/aplikasi/kotak-masukan/polling/admin${buildListQuery(
        withSort(
          [
            ['q', params?.q],
            ['is_active', params?.is_active],
            ['page', params?.page],
            ['per_page', params?.per_page],
          ],
          params,
        ),
      )}`,
    )
  },
  adminCreate(data: AppPollAdminInput) {
    return apiRequest<AppPollRow>('/aplikasi/kotak-masukan/polling/admin', {
      method: 'POST',
      body: data,
    })
  },
  adminUpdate(id: number, data: Partial<AppPollAdminInput>) {
    return apiRequest<AppPollRow>(`/aplikasi/kotak-masukan/polling/admin/${id}`, {
      method: 'PATCH',
      body: data,
    })
  },
}
