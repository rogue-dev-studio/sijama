/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:35:53
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:35:53
 */

import type { ReactElement, ReactNode } from 'react'
import { Route } from 'react-router-dom'
import { PermissionRoute } from './auth/PermissionRoute'
import { AbsensiPage } from './pages/AbsensiPage'
import { AplikasiKonfigDokumenFormPage } from './pages/AplikasiKonfigDokumenFormPage'
import { AplikasiKonfigDokumenPage } from './pages/AplikasiKonfigDokumenPage'
import { AplikasiKonfigPage } from './pages/AplikasiKonfigPage'
import { DashboardPage } from './pages/DashboardPage'
import { KehadiranPage } from './pages/KehadiranPage'
import { KalenderPage } from './pages/KalenderPage'
import { KategoriUmurPage } from './pages/KategoriUmurPage'
import { LaporanJamaahPage } from './pages/LaporanJamaahPage'
import { LaporanKehadiranPage } from './pages/LaporanKehadiranPage'
import { LaporanKegiatanPage } from './pages/LaporanKegiatanPage'
import { LaporanPengajianPage } from './pages/LaporanPengajianPage'
import { JamaahFaceEnrollPage } from './pages/JamaahFaceEnrollPage'
import { JamaahFormPage } from './pages/JamaahFormPage'
import { JamaahListPage } from './pages/JamaahListPage'
import { KeluargaFormPage } from './pages/KeluargaFormPage'
import { KeluargaListPage } from './pages/KeluargaListPage'
import { KegiatanFormPage } from './pages/KegiatanFormPage'
import { KegiatanPage } from './pages/KegiatanPage'
import { MasterAdmDesaKelurahanFormPage } from './pages/MasterAdmDesaKelurahanFormPage'
import { MasterAdmDesaKelurahanPage } from './pages/MasterAdmDesaKelurahanPage'
import { MasterAdmKabupatenKotaFormPage } from './pages/MasterAdmKabupatenKotaFormPage'
import { MasterAdmKabupatenKotaPage } from './pages/MasterAdmKabupatenKotaPage'
import { MasterAdmKecamatanFormPage } from './pages/MasterAdmKecamatanFormPage'
import { MasterAdmKecamatanPage } from './pages/MasterAdmKecamatanPage'
import { MasterAdmKodePosFormPage } from './pages/MasterAdmKodePosFormPage'
import { MasterAdmKodePosPage } from './pages/MasterAdmKodePosPage'
import { MasterAdmNegaraFormPage } from './pages/MasterAdmNegaraFormPage'
import { MasterAdmNegaraPage } from './pages/MasterAdmNegaraPage'
import { MasterAdmProvinsiFormPage } from './pages/MasterAdmProvinsiFormPage'
import { MasterAdmProvinsiPage } from './pages/MasterAdmProvinsiPage'
import { MasterDaerahFormPage } from './pages/MasterDaerahFormPage'
import { MasterDaerahPage } from './pages/MasterDaerahPage'
import { MasterDesaFormPage } from './pages/MasterDesaFormPage'
import { MasterDesaPage } from './pages/MasterDesaPage'
import { MasterDapukanFormPage } from './pages/MasterDapukanFormPage'
import { MasterDapukanPage } from './pages/MasterDapukanPage'
import { MasterFiturFormPage } from './pages/MasterFiturFormPage'
import { MasterFiturPage } from './pages/MasterFiturPage'
import { MasterHakAksesFormPage } from './pages/MasterHakAksesFormPage'
import { MasterHakAksesPage } from './pages/MasterHakAksesPage'
import { MasterKelompokFormPage } from './pages/MasterKelompokFormPage'
import { MasterKelompokPage } from './pages/MasterKelompokPage'
import { MasterKategoriKegiatanFormPage } from './pages/MasterKategoriKegiatanFormPage'
import { MasterKategoriKegiatanPage } from './pages/MasterKategoriKegiatanPage'
import { MasterLokasiFormPage } from './pages/MasterLokasiFormPage'
import { MasterLokasiPage } from './pages/MasterLokasiPage'
import { MasterLookupFormPage } from './pages/MasterLookupFormPage'
import { MasterLookupPage } from './pages/MasterLookupPage'
import { MasterMateriFormPage } from './pages/MasterMateriFormPage'
import { MasterMateriPage } from './pages/MasterMateriPage'
import { MasterMatriksPage } from './pages/MasterMatriksPage'
import { MasterMenuFormPage } from './pages/MasterMenuFormPage'
import { MasterMenuPage } from './pages/MasterMenuPage'
import { MasterPemateriFormPage } from './pages/MasterPemateriFormPage'
import { MasterPemateriPage } from './pages/MasterPemateriPage'
import { MasterPusatFormPage } from './pages/MasterPusatFormPage'
import { MasterPusatPage } from './pages/MasterPusatPage'
import { MasterSubKelompokFormPage } from './pages/MasterSubKelompokFormPage'
import { MasterSubKelompokPage } from './pages/MasterSubKelompokPage'
import { MasterUsersFormPage } from './pages/MasterUsersFormPage'
import { MasterUsersPage } from './pages/MasterUsersPage'
import { PengajianFormPage } from './pages/PengajianFormPage'
import { PengajianPage } from './pages/PengajianPage'
import { ProfilePage } from './pages/ProfilePage'

export type AppRouteDef = {
  path?: string
  index?: boolean
  permission?: string
  element: ReactNode
}

function masterCrud(
  base: string,
  permission: string,
  List: () => ReactNode,
  Form: () => ReactNode,
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
  { path: 'pengajian', permission: 'pengajian.view', element: <PengajianPage /> },
  { path: 'pengajian/new', permission: 'pengajian.create', element: <PengajianFormPage /> },
  { path: 'pengajian/:id/edit', permission: 'pengajian.update', element: <PengajianFormPage /> },
  { path: 'kegiatan', permission: 'kegiatan.view', element: <KegiatanPage /> },
  { path: 'kegiatan/new', permission: 'kegiatan.create', element: <KegiatanFormPage /> },
  { path: 'kegiatan/:id/edit', permission: 'kegiatan.update', element: <KegiatanFormPage /> },
  { path: 'absensi', permission: 'absensi.view', element: <AbsensiPage /> },
  { path: 'laporan/kehadiran', permission: 'laporan_kehadiran.view', element: <LaporanKehadiranPage /> },
  { path: 'laporan/jamaah', permission: 'laporan_jamaah.view', element: <LaporanJamaahPage /> },
  { path: 'laporan/pengajian', permission: 'laporan_pengajian.view', element: <LaporanPengajianPage /> },
  { path: 'laporan/kegiatan', permission: 'laporan_kegiatan.view', element: <LaporanKegiatanPage /> },
  { path: 'profil', element: <ProfilePage /> },
  ...masterCrud('master/pusat', 'pusat', MasterPusatPage, MasterPusatFormPage),
  ...masterCrud('master/daerah', 'daerah', MasterDaerahPage, MasterDaerahFormPage),
  ...masterCrud('master/desa', 'desa', MasterDesaPage, MasterDesaFormPage),
  ...masterCrud('master/kelompok', 'kelompok', MasterKelompokPage, MasterKelompokFormPage),
  ...masterCrud('master/sub-kelompok', 'sub_kelompok', MasterSubKelompokPage, MasterSubKelompokFormPage),
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
  ...masterCrud('master/adm/negara', 'adm_negara', MasterAdmNegaraPage, MasterAdmNegaraFormPage),
  ...masterCrud('master/adm/provinsi', 'adm_provinsi', MasterAdmProvinsiPage, MasterAdmProvinsiFormPage),
  ...masterCrud(
    'master/adm/kabupaten-kota',
    'adm_kabupaten_kota',
    MasterAdmKabupatenKotaPage,
    MasterAdmKabupatenKotaFormPage,
  ),
  ...masterCrud('master/adm/kecamatan', 'adm_kecamatan', MasterAdmKecamatanPage, MasterAdmKecamatanFormPage),
  ...masterCrud(
    'master/adm/desa-kelurahan',
    'adm_desa_kelurahan',
    MasterAdmDesaKelurahanPage,
    MasterAdmDesaKelurahanFormPage,
  ),
  ...masterCrud('master/adm/kode-pos', 'adm_kode_pos', MasterAdmKodePosPage, MasterAdmKodePosFormPage),
  ...masterCrud('master/dapukan', 'dapukan', MasterDapukanPage, MasterDapukanFormPage),
  ...masterCrud('master/menu', 'menu', MasterMenuPage, MasterMenuFormPage),
  ...masterCrud('master/fitur', 'fitur', MasterFiturPage, MasterFiturFormPage),
  ...masterCrud('master/hak-akses', 'hak_akses', MasterHakAksesPage, MasterHakAksesFormPage),
  { path: 'master/matriks', permission: 'matriks.view', element: <MasterMatriksPage /> },
  ...masterCrud('master/users', 'users', MasterUsersPage, MasterUsersFormPage),
  { path: 'aplikasi/konfig', permission: 'konfig.view', element: <AplikasiKonfigPage /> },
  {
    path: 'aplikasi/konfig-dokumen',
    permission: 'konfig_dokumen.view',
    element: <AplikasiKonfigDokumenPage />,
  },
  {
    path: 'aplikasi/konfig-dokumen/:lookupId/edit',
    permission: 'konfig_dokumen.view',
    element: <AplikasiKonfigDokumenFormPage />,
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
