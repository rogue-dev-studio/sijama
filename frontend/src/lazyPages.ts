/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 05:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 05:30:00
 */

import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

function lazyNamed<T extends ComponentType<any>>(
  loader: () => Promise<Record<string, T>>,
  exportName: string,
): LazyExoticComponent<T> {
  return lazy(async () => {
    const module = await loader()
    const component = module[exportName]
    if (!component) {
      throw new Error(`Missing export "${exportName}" in lazy page module`)
    }
    return { default: component }
  })
}

export const AbsensiPage = lazyNamed(() => import('./pages/AbsensiPage'), 'AbsensiPage')
export const AplikasiKonfigDokumenFormPage = lazyNamed(
  () => import('./pages/AplikasiKonfigDokumenFormPage'),
  'AplikasiKonfigDokumenFormPage',
)
export const AplikasiKonfigDokumenPage = lazyNamed(
  () => import('./pages/AplikasiKonfigDokumenPage'),
  'AplikasiKonfigDokumenPage',
)
export const AplikasiKonfigPage = lazyNamed(() => import('./pages/AplikasiKonfigPage'), 'AplikasiKonfigPage')
export const AuditLoginPage = lazyNamed(() => import('./pages/AuditLoginPage'), 'AuditLoginPage')
export const AuditAksesPage = lazyNamed(() => import('./pages/AuditActivityPages'), 'AuditAksesPage')
export const AuditKonfigPage = lazyNamed(() => import('./pages/AuditActivityPages'), 'AuditKonfigPage')
export const AuditJamaahPage = lazyNamed(() => import('./pages/AuditActivityPages'), 'AuditJamaahPage')
export const AppErrorLogPage = lazyNamed(() => import('./pages/AppErrorLogPage'), 'AppErrorLogPage')
export const IntegrationLogPage = lazyNamed(() => import('./pages/IntegrationLogPage'), 'IntegrationLogPage')
export const DashboardPage = lazyNamed(() => import('./pages/DashboardPage'), 'DashboardPage')
export const KehadiranPage = lazyNamed(() => import('./pages/KehadiranPage'), 'KehadiranPage')
export const KalenderPage = lazyNamed(() => import('./pages/KalenderPage'), 'KalenderPage')
export const KategoriUmurPage = lazyNamed(() => import('./pages/KategoriUmurPage'), 'KategoriUmurPage')
export const LaporanJamaahPage = lazyNamed(() => import('./pages/LaporanJamaahPage'), 'LaporanJamaahPage')
export const LaporanKehadiranPage = lazyNamed(() => import('./pages/LaporanKehadiranPage'), 'LaporanKehadiranPage')
export const LaporanKegiatanPage = lazyNamed(() => import('./pages/LaporanKegiatanPage'), 'LaporanKegiatanPage')
export const JamaahFaceEnrollPage = lazyNamed(() => import('./pages/JamaahFaceEnrollPage'), 'JamaahFaceEnrollPage')
export const JamaahFormPage = lazyNamed(() => import('./pages/JamaahFormPage'), 'JamaahFormPage')
export const JamaahListPage = lazyNamed(() => import('./pages/JamaahListPage'), 'JamaahListPage')
export const KeluargaFormPage = lazyNamed(() => import('./pages/KeluargaFormPage'), 'KeluargaFormPage')
export const KeluargaListPage = lazyNamed(() => import('./pages/KeluargaListPage'), 'KeluargaListPage')
export const KegiatanFormPage = lazyNamed(() => import('./pages/KegiatanFormPage'), 'KegiatanFormPage')
export const KegiatanJadwalRutinFormPage = lazyNamed(
  () => import('./pages/KegiatanJadwalRutinFormPage'),
  'KegiatanJadwalRutinFormPage',
)
export const KegiatanJadwalRutinPage = lazyNamed(
  () => import('./pages/KegiatanJadwalRutinPage'),
  'KegiatanJadwalRutinPage',
)
export const KegiatanPage = lazyNamed(() => import('./pages/KegiatanPage'), 'KegiatanPage')
export const MasterAdmDesaKelurahanFormPage = lazyNamed(
  () => import('./pages/MasterAdmDesaKelurahanFormPage'),
  'MasterAdmDesaKelurahanFormPage',
)
export const MasterAdmDesaKelurahanPage = lazyNamed(
  () => import('./pages/MasterAdmDesaKelurahanPage'),
  'MasterAdmDesaKelurahanPage',
)
export const MasterAdmKabupatenKotaFormPage = lazyNamed(
  () => import('./pages/MasterAdmKabupatenKotaFormPage'),
  'MasterAdmKabupatenKotaFormPage',
)
export const MasterAdmKabupatenKotaPage = lazyNamed(
  () => import('./pages/MasterAdmKabupatenKotaPage'),
  'MasterAdmKabupatenKotaPage',
)
export const MasterAdmKecamatanFormPage = lazyNamed(
  () => import('./pages/MasterAdmKecamatanFormPage'),
  'MasterAdmKecamatanFormPage',
)
export const MasterAdmKecamatanPage = lazyNamed(
  () => import('./pages/MasterAdmKecamatanPage'),
  'MasterAdmKecamatanPage',
)
export const MasterAdmKodePosFormPage = lazyNamed(
  () => import('./pages/MasterAdmKodePosFormPage'),
  'MasterAdmKodePosFormPage',
)
export const MasterAdmKodePosPage = lazyNamed(() => import('./pages/MasterAdmKodePosPage'), 'MasterAdmKodePosPage')
export const MasterAdmNegaraFormPage = lazyNamed(
  () => import('./pages/MasterAdmNegaraFormPage'),
  'MasterAdmNegaraFormPage',
)
export const MasterAdmNegaraPage = lazyNamed(() => import('./pages/MasterAdmNegaraPage'), 'MasterAdmNegaraPage')
export const MasterAdmProvinsiFormPage = lazyNamed(
  () => import('./pages/MasterAdmProvinsiFormPage'),
  'MasterAdmProvinsiFormPage',
)
export const MasterAdmProvinsiPage = lazyNamed(() => import('./pages/MasterAdmProvinsiPage'), 'MasterAdmProvinsiPage')
export const MasterDaerahFormPage = lazyNamed(() => import('./pages/MasterDaerahFormPage'), 'MasterDaerahFormPage')
export const MasterDaerahPage = lazyNamed(() => import('./pages/MasterDaerahPage'), 'MasterDaerahPage')
export const MasterDesaFormPage = lazyNamed(() => import('./pages/MasterDesaFormPage'), 'MasterDesaFormPage')
export const MasterDesaPage = lazyNamed(() => import('./pages/MasterDesaPage'), 'MasterDesaPage')
export const MasterDapukanFormPage = lazyNamed(() => import('./pages/MasterDapukanFormPage'), 'MasterDapukanFormPage')
export const MasterDapukanPage = lazyNamed(() => import('./pages/MasterDapukanPage'), 'MasterDapukanPage')
export const MasterFiturFormPage = lazyNamed(() => import('./pages/MasterFiturFormPage'), 'MasterFiturFormPage')
export const MasterFiturPage = lazyNamed(() => import('./pages/MasterFiturPage'), 'MasterFiturPage')
export const MasterHakAksesFormPage = lazyNamed(
  () => import('./pages/MasterHakAksesFormPage'),
  'MasterHakAksesFormPage',
)
export const MasterHakAksesPage = lazyNamed(() => import('./pages/MasterHakAksesPage'), 'MasterHakAksesPage')
export const MasterKelompokFormPage = lazyNamed(() => import('./pages/MasterKelompokFormPage'), 'MasterKelompokFormPage')
export const MasterKelompokPage = lazyNamed(() => import('./pages/MasterKelompokPage'), 'MasterKelompokPage')
export const MasterKategoriKegiatanFormPage = lazyNamed(
  () => import('./pages/MasterKategoriKegiatanFormPage'),
  'MasterKategoriKegiatanFormPage',
)
export const MasterKategoriKegiatanPage = lazyNamed(
  () => import('./pages/MasterKategoriKegiatanPage'),
  'MasterKategoriKegiatanPage',
)
export const MasterLokasiFormPage = lazyNamed(() => import('./pages/MasterLokasiFormPage'), 'MasterLokasiFormPage')
export const MasterLokasiPage = lazyNamed(() => import('./pages/MasterLokasiPage'), 'MasterLokasiPage')
export const MasterLookupFormPage = lazyNamed(() => import('./pages/MasterLookupFormPage'), 'MasterLookupFormPage')
export const MasterLookupPage = lazyNamed(() => import('./pages/MasterLookupPage'), 'MasterLookupPage')
export const MasterMateriFormPage = lazyNamed(() => import('./pages/MasterMateriFormPage'), 'MasterMateriFormPage')
export const MasterMateriPage = lazyNamed(() => import('./pages/MasterMateriPage'), 'MasterMateriPage')
export const MasterMatriksPage = lazyNamed(() => import('./pages/MasterMatriksPage'), 'MasterMatriksPage')
export const MasterMenuFormPage = lazyNamed(() => import('./pages/MasterMenuFormPage'), 'MasterMenuFormPage')
export const MasterMenuPage = lazyNamed(() => import('./pages/MasterMenuPage'), 'MasterMenuPage')
export const MasterPemateriFormPage = lazyNamed(() => import('./pages/MasterPemateriFormPage'), 'MasterPemateriFormPage')
export const MasterPemateriPage = lazyNamed(() => import('./pages/MasterPemateriPage'), 'MasterPemateriPage')
export const MasterPusatFormPage = lazyNamed(() => import('./pages/MasterPusatFormPage'), 'MasterPusatFormPage')
export const MasterPusatPage = lazyNamed(() => import('./pages/MasterPusatPage'), 'MasterPusatPage')
export const MasterSubKelompokFormPage = lazyNamed(
  () => import('./pages/MasterSubKelompokFormPage'),
  'MasterSubKelompokFormPage',
)
export const MasterSubKelompokPage = lazyNamed(() => import('./pages/MasterSubKelompokPage'), 'MasterSubKelompokPage')
export const MasterUsersFormPage = lazyNamed(() => import('./pages/MasterUsersFormPage'), 'MasterUsersFormPage')
export const MasterUsersPage = lazyNamed(() => import('./pages/MasterUsersPage'), 'MasterUsersPage')
export const ProfilePage = lazyNamed(() => import('./pages/ProfilePage'), 'ProfilePage')
export const AppReportFormPage = lazyNamed(() => import('./pages/AppReportFormPage'), 'AppReportFormPage')
export const AppReportStatusPage = lazyNamed(() => import('./pages/AppReportStatusPage'), 'AppReportStatusPage')
export const AppReportAdminPage = lazyNamed(() => import('./pages/AppReportAdminPage'), 'AppReportAdminPage')
export const AppFeedbackIdeaFormPage = lazyNamed(
  () => import('./pages/AppFeedbackIdeaFormPage'),
  'AppFeedbackIdeaFormPage',
)
export const AppFeedbackIdeaStatusPage = lazyNamed(
  () => import('./pages/AppFeedbackIdeaStatusPage'),
  'AppFeedbackIdeaStatusPage',
)
export const AppFeedbackTestimonialFormPage = lazyNamed(
  () => import('./pages/AppFeedbackTestimonialFormPage'),
  'AppFeedbackTestimonialFormPage',
)
export const AppFeedbackAdminPage = lazyNamed(() => import('./pages/AppFeedbackAdminPage'), 'AppFeedbackAdminPage')
export const AppTestimonialGalleryPage = lazyNamed(
  () => import('./pages/AppTestimonialGalleryPage'),
  'AppTestimonialGalleryPage',
)
export const AppTestimonialAdminPage = lazyNamed(
  () => import('./pages/AppTestimonialAdminPage'),
  'AppTestimonialAdminPage',
)
