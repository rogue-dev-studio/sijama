/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:35:53
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:35:53
 */

import type { ComponentType, LazyExoticComponent, ReactElement, ReactNode } from 'react'
import { Route } from 'react-router-dom'
import { PermissionRoute } from './auth/PermissionRoute'
import { SuperAdminRoute } from './auth/SuperAdminRoute'
import {
  AbsensiPage,
  AplikasiKonfigDokumenFormPage,
  AplikasiKonfigDokumenPage,
  AplikasiKonfigPage,
  AuditLoginPage,
  AuditAksesPage,
  AuditKonfigPage,
  AuditJamaahPage,
  AppErrorLogPage,
  IntegrationLogPage,
  DashboardPage,
  JamaahFaceEnrollPage,
  JamaahFormPage,
  JamaahListPage,
  KalenderPage,
  KategoriUmurPage,
  KehadiranPage,
  KeluargaFormPage,
  KeluargaListPage,
  KegiatanFormPage,
  KegiatanJadwalRutinFormPage,
  KegiatanJadwalRutinPage,
  KegiatanPage,
  LaporanJamaahPage,
  LaporanKehadiranPage,
  LaporanKegiatanPage,
  MasterAdmDesaKelurahanFormPage,
  MasterAdmDesaKelurahanPage,
  MasterAdmKabupatenKotaFormPage,
  MasterAdmKabupatenKotaPage,
  MasterAdmKecamatanFormPage,
  MasterAdmKecamatanPage,
  MasterAdmKodePosFormPage,
  MasterAdmKodePosPage,
  MasterAdmNegaraFormPage,
  MasterAdmNegaraPage,
  MasterAdmProvinsiFormPage,
  MasterAdmProvinsiPage,
  MasterDaerahFormPage,
  MasterDaerahPage,
  MasterDesaFormPage,
  MasterDesaPage,
  MasterDapukanFormPage,
  MasterDapukanPage,
  MasterFiturFormPage,
  MasterFiturPage,
  MasterHakAksesFormPage,
  MasterHakAksesPage,
  MasterKelompokFormPage,
  MasterKelompokPage,
  MasterKategoriKegiatanFormPage,
  MasterKategoriKegiatanPage,
  MasterLokasiFormPage,
  MasterLokasiPage,
  MasterLookupFormPage,
  MasterLookupPage,
  MasterMateriFormPage,
  MasterMateriPage,
  MasterMatriksPage,
  MasterMenuFormPage,
  MasterMenuPage,
  MasterPemateriFormPage,
  MasterPemateriPage,
  MasterPusatFormPage,
  MasterPusatPage,
  MasterSubKelompokFormPage,
  MasterSubKelompokPage,
  MasterUsersFormPage,
  MasterUsersPage,
  ProfilePage,
  AppReportFormPage,
  AppReportStatusPage,
  AppReportAdminPage,
  AppFeedbackIdeaFormPage,
  AppFeedbackIdeaStatusPage,
  AppFeedbackTestimonialFormPage,
  AppFeedbackAdminPage,
  AppTestimonialGalleryPage,
  AppTestimonialAdminPage,
} from './lazyPages'

export type AppRouteDef = {
  path?: string
  index?: boolean
  permission?: string
  element: ReactNode
}

function superAdminRoute(element: ReactNode): ReactNode {
  return <SuperAdminRoute>{element}</SuperAdminRoute>
}

function masterCrud(
  base: string,
  permission: string,
  List: LazyExoticComponent<ComponentType>,
  Form: LazyExoticComponent<ComponentType>,
): AppRouteDef[] {
  return [
    { path: base, permission: `${permission}.view`, element: <List /> },
    { path: `${base}/new`, permission: `${permission}.create`, element: <Form /> },
    { path: `${base}/:id/edit`, permission: `${permission}.update`, element: <Form /> },
  ]
}

export const APP_SHELL_ROUTES: AppRouteDef[] = [
  { index: true, permission: 'dashboard.view', element: <DashboardPage /> },
  { path: 'kehadiran', permission: 'kehadiran.view', element: <KehadiranPage /> },
  { path: 'kategori-umur', permission: 'kategori_umur.view', element: <KategoriUmurPage /> },
  { path: 'kalender', permission: 'kalender.view', element: <KalenderPage /> },
  { path: 'jamaah', permission: 'jamaah.view', element: <JamaahListPage /> },
  { path: 'jamaah/new', permission: 'jamaah.create', element: <JamaahFormPage /> },
  { path: 'jamaah/:id/edit', permission: 'jamaah.update', element: <JamaahFormPage /> },
  { path: 'jamaah/:id/face', permission: 'jamaah.enroll_face', element: <JamaahFaceEnrollPage /> },
  { path: 'keluarga', permission: 'keluarga.view', element: <KeluargaListPage /> },
  { path: 'keluarga/new', permission: 'keluarga.create', element: <KeluargaFormPage /> },
  { path: 'keluarga/:id/edit', permission: 'keluarga.update', element: <KeluargaFormPage /> },
  { path: 'kegiatan/jadwal-rutin', permission: 'kegiatan.view', element: <KegiatanJadwalRutinPage /> },
  { path: 'kegiatan/jadwal-rutin/new', permission: 'kegiatan.create', element: <KegiatanJadwalRutinFormPage /> },
  { path: 'kegiatan/jadwal-rutin/:id/edit', permission: 'kegiatan.update', element: <KegiatanJadwalRutinFormPage /> },
  { path: 'kegiatan', permission: 'kegiatan.view', element: <KegiatanPage /> },
  { path: 'kegiatan/new', permission: 'kegiatan.create', element: <KegiatanFormPage /> },
  { path: 'kegiatan/:id/edit', permission: 'kegiatan.update', element: <KegiatanFormPage /> },
  { path: 'absensi', permission: 'absensi.view', element: <AbsensiPage /> },
  { path: 'laporan/kehadiran', permission: 'laporan_kehadiran.view', element: <LaporanKehadiranPage /> },
  { path: 'laporan/jamaah', permission: 'laporan_jamaah.view', element: <LaporanJamaahPage /> },
  { path: 'laporan/kegiatan', permission: 'laporan_kegiatan.view', element: <LaporanKegiatanPage /> },
  { path: 'profil', element: <ProfilePage /> },
  ...masterCrud('master/wilayah-fung/pusat', 'wilayah_fung_pusat', MasterPusatPage, MasterPusatFormPage),
  ...masterCrud('master/wilayah-fung/daerah', 'wilayah_fung_daerah', MasterDaerahPage, MasterDaerahFormPage),
  ...masterCrud('master/wilayah-fung/desa', 'wilayah_fung_desa', MasterDesaPage, MasterDesaFormPage),
  ...masterCrud('master/wilayah-fung/kelompok', 'wilayah_fung_kelompok', MasterKelompokPage, MasterKelompokFormPage),
  ...masterCrud('master/wilayah-fung/sub-kelompok', 'wilayah_fung_sub_kelompok', MasterSubKelompokPage, MasterSubKelompokFormPage),
  ...masterCrud('master/lokasi', 'lokasi', MasterLokasiPage, MasterLokasiFormPage),
  ...masterCrud('master/pemateri', 'pemateri', MasterPemateriPage, MasterPemateriFormPage),
  ...masterCrud('master/lookup', 'lookup', MasterLookupPage, MasterLookupFormPage),
  ...masterCrud('master/materi', 'materi', MasterMateriPage, MasterMateriFormPage),
  ...masterCrud(
    'master/kategori-kegiatan',
    'kategori_kegiatan',
    MasterKategoriKegiatanPage,
    MasterKategoriKegiatanFormPage,
  ),
  ...masterCrud('master/wilayah-adm/negara', 'wilayah_adm_negara', MasterAdmNegaraPage, MasterAdmNegaraFormPage),
  ...masterCrud('master/wilayah-adm/provinsi', 'wilayah_adm_provinsi', MasterAdmProvinsiPage, MasterAdmProvinsiFormPage),
  ...masterCrud(
    'master/wilayah-adm/kabupaten-kota',
    'wilayah_adm_kabupaten_kota',
    MasterAdmKabupatenKotaPage,
    MasterAdmKabupatenKotaFormPage,
  ),
  ...masterCrud('master/wilayah-adm/kecamatan', 'wilayah_adm_kecamatan', MasterAdmKecamatanPage, MasterAdmKecamatanFormPage),
  ...masterCrud(
    'master/wilayah-adm/desa',
    'wilayah_adm_desa',
    MasterAdmDesaKelurahanPage,
    MasterAdmDesaKelurahanFormPage,
  ),
  ...masterCrud('master/wilayah-adm/kode-pos', 'wilayah_adm_kode_pos', MasterAdmKodePosPage, MasterAdmKodePosFormPage),
  ...masterCrud('master/dapukan', 'dapukan', MasterDapukanPage, MasterDapukanFormPage).map((route) =>
    route.path?.includes('/new') || route.path?.includes('/edit')
      ? { ...route, element: superAdminRoute(route.element) }
      : route,
  ),
  ...masterCrud('master/menu', 'menu', MasterMenuPage, MasterMenuFormPage).map((route) => ({
    ...route,
    element: superAdminRoute(route.element),
  })),
  ...masterCrud('master/fitur', 'fitur', MasterFiturPage, MasterFiturFormPage).map((route) => ({
    ...route,
    element: superAdminRoute(route.element),
  })),
  ...masterCrud('master/hak-akses', 'hak_akses', MasterHakAksesPage, MasterHakAksesFormPage).map((route) => ({
    ...route,
    element: superAdminRoute(route.element),
  })),
  { path: 'master/matriks', permission: 'matriks.view', element: superAdminRoute(<MasterMatriksPage />) },
  ...masterCrud('master/users', 'users', MasterUsersPage, MasterUsersFormPage),
  { path: 'aplikasi/konfig', permission: 'konfig.view', element: superAdminRoute(<AplikasiKonfigPage />) },
  {
    path: 'aplikasi/konfig-dokumen',
    permission: 'konfig_dokumen.view',
    element: superAdminRoute(<AplikasiKonfigDokumenPage />),
  },
  {
    path: 'aplikasi/konfig-dokumen/:lookupId/edit',
    permission: 'konfig_dokumen.view',
    element: superAdminRoute(<AplikasiKonfigDokumenFormPage />),
  },
  {
    path: 'aplikasi/audit/login',
    permission: 'audit_login.view',
    element: superAdminRoute(<AuditLoginPage />),
  },
  {
    path: 'aplikasi/audit/akses',
    permission: 'audit_access.view',
    element: superAdminRoute(<AuditAksesPage />),
  },
  {
    path: 'aplikasi/audit/konfig',
    permission: 'audit_konfig.view',
    element: superAdminRoute(<AuditKonfigPage />),
  },
  {
    path: 'aplikasi/audit/jamaah',
    permission: 'audit_jamaah.view',
    element: superAdminRoute(<AuditJamaahPage />),
  },
  {
    path: 'aplikasi/log/error',
    permission: 'app_error_log.view',
    element: superAdminRoute(<AppErrorLogPage />),
  },
  {
    path: 'aplikasi/log/database',
    permission: 'integration_log_database.view',
    element: superAdminRoute(
      <IntegrationLogPage
        provider="database"
        title="Log Database"
        description="Masa berlaku, maintenance, dan konektivitas database."
        permissionPrefix="integration_log_database"
        basePath="/aplikasi/log/database"
      />,
    ),
  },
  {
    path: 'aplikasi/log/telegram',
    permission: 'integration_log_telegram.view',
    element: superAdminRoute(
      <IntegrationLogPage
        provider="telegram"
        title="Log Telegram"
        description="Masa berlaku, maintenance, dan konektivitas bot Telegram."
        permissionPrefix="integration_log_telegram"
        basePath="/aplikasi/log/telegram"
      />,
    ),
  },
  {
    path: 'aplikasi/log/smtp',
    permission: 'integration_log_smtp.view',
    element: superAdminRoute(
      <IntegrationLogPage
        provider="smtp"
        title="Log SMTP"
        description="Masa berlaku dan konektivitas host SMTP / mail provider."
        permissionPrefix="integration_log_smtp"
        basePath="/aplikasi/log/smtp"
      />,
    ),
  },
  {
    path: 'aplikasi/log/fonnte',
    permission: 'integration_log_fonnte.view',
    element: superAdminRoute(
      <IntegrationLogPage
        provider="fonnte"
        title="Log Fonnte"
        description="Masa berlaku dan konektivitas endpoint Fonnte."
        permissionPrefix="integration_log_fonnte"
        basePath="/aplikasi/log/fonnte"
      />,
    ),
  },
  {
    path: 'aplikasi/log/n8n',
    permission: 'integration_log_n8n.view',
    element: superAdminRoute(
      <IntegrationLogPage
        provider="n8n"
        title="Log n8n"
        description="Masa berlaku dan konektivitas instance / webhook n8n."
        permissionPrefix="integration_log_n8n"
        basePath="/aplikasi/log/n8n"
      />,
    ),
  },
  {
    path: 'aplikasi/log/api-co-id',
    permission: 'integration_log_api_co_id.view',
    element: superAdminRoute(
      <IntegrationLogPage
        provider="api_co_id"
        title="Log api.co.id"
        description="Masa berlaku API key dan konektivitas hari libur."
        permissionPrefix="integration_log_api_co_id"
        basePath="/aplikasi/log/api-co-id"
      />,
    ),
  },
  {
    path: 'aplikasi/laporkan/teknis',
    permission: 'app_report_teknis.view',
    element: <AppReportFormPage />,
  },
  {
    path: 'aplikasi/laporkan/nonteknis',
    permission: 'app_report_nonteknis.view',
    element: <AppReportFormPage />,
  },
  {
    path: 'aplikasi/laporkan/status',
    permission: 'app_report_status.view',
    element: <AppReportStatusPage />,
  },
  {
    path: 'aplikasi/laporkan/informasi',
    permission: 'app_report_admin.view',
    element: superAdminRoute(<AppReportAdminPage />),
  },
  {
    path: 'aplikasi/kotak-masukan/ide',
    permission: 'app_feedback_idea.view',
    element: <AppFeedbackIdeaFormPage />,
  },
  {
    path: 'aplikasi/kotak-masukan/ide/status',
    permission: 'app_feedback_idea_status.view',
    element: <AppFeedbackIdeaStatusPage />,
  },
  {
    path: 'aplikasi/kotak-masukan/testimoni',
    permission: 'app_feedback_testimonial.view',
    element: <AppFeedbackTestimonialFormPage />,
  },
  {
    path: 'aplikasi/kotak-masukan/informasi',
    permission: 'app_feedback_admin.view',
    element: superAdminRoute(<AppFeedbackAdminPage />),
  },
  {
    path: 'aplikasi/kotak-masukan/galeri-testimoni',
    permission: 'app_feedback_gallery.view',
    element: <AppTestimonialGalleryPage />,
  },
  {
    path: 'aplikasi/kotak-masukan/daftar-testimoni',
    permission: 'app_feedback_testimonial_admin.view',
    element: superAdminRoute(<AppTestimonialAdminPage />),
  },
]

export function renderAppRoutes(defs: AppRouteDef[]): ReactElement[] {
  return defs.map((def) => {
    const wrapped = def.permission ? (
      <PermissionRoute permission={def.permission}>{def.element}</PermissionRoute>
    ) : (
      def.element
    )

    if (def.index) {
      return <Route key="__index" index element={wrapped} />
    }

    return <Route key={def.path} path={def.path} element={wrapped} />
  })
}
