import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { PermissionRoute } from './auth/PermissionRoute'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppShell } from './layout/AppShell'
import { AbsensiPage } from './pages/AbsensiPage'
import { DashboardPage } from './pages/DashboardPage'
import { KehadiranPage } from './pages/KehadiranPage'
import { KalenderPage } from './pages/KalenderPage'
import { KategoriUmurPage } from './pages/KategoriUmurPage'
import { JamaahFaceEnrollPage } from './pages/JamaahFaceEnrollPage'
import { JamaahFormPage } from './pages/JamaahFormPage'
import { JamaahListPage } from './pages/JamaahListPage'
import { KegiatanFormPage } from './pages/KegiatanFormPage'
import { KegiatanPage } from './pages/KegiatanPage'
import { LoginPage } from './pages/LoginPage'
import { MasterAdmDesaKelurahanPage } from './pages/MasterAdmDesaKelurahanPage'
import { MasterAdmKabupatenKotaPage } from './pages/MasterAdmKabupatenKotaPage'
import { MasterAdmKecamatanPage } from './pages/MasterAdmKecamatanPage'
import { MasterAdmKodePosPage } from './pages/MasterAdmKodePosPage'
import { MasterAdmNegaraPage } from './pages/MasterAdmNegaraPage'
import { MasterAdmProvinsiPage } from './pages/MasterAdmProvinsiPage'
import { MasterDaerahPage } from './pages/MasterDaerahPage'
import { MasterDesaPage } from './pages/MasterDesaPage'
import { MasterDapukanPage } from './pages/MasterDapukanPage'
import { MasterFiturPage } from './pages/MasterFiturPage'
import { MasterHakAksesPage } from './pages/MasterHakAksesPage'
import { MasterKelompokPage } from './pages/MasterKelompokPage'
import { MasterKategoriKegiatanFormPage } from './pages/MasterKategoriKegiatanFormPage'
import { MasterKategoriKegiatanPage } from './pages/MasterKategoriKegiatanPage'
import { MasterLokasiFormPage } from './pages/MasterLokasiFormPage'
import { MasterLokasiPage } from './pages/MasterLokasiPage'
import { MasterMateriFormPage } from './pages/MasterMateriFormPage'
import { MasterMateriPage } from './pages/MasterMateriPage'
import { MasterMatriksPage } from './pages/MasterMatriksPage'
import { MasterMenuPage } from './pages/MasterMenuPage'
import { MasterPemateriFormPage } from './pages/MasterPemateriFormPage'
import { MasterPemateriPage } from './pages/MasterPemateriPage'
import { MasterPekerjaanFormPage } from './pages/MasterPekerjaanFormPage'
import { MasterPekerjaanPage } from './pages/MasterPekerjaanPage'
import { MasterPusatPage } from './pages/MasterPusatPage'
import { MasterSubKelompokPage } from './pages/MasterSubKelompokPage'
import { MasterUsersFormPage } from './pages/MasterUsersFormPage'
import { MasterUsersPage } from './pages/MasterUsersPage'
import { PengajianFormPage } from './pages/PengajianFormPage'
import { PengajianPage } from './pages/PengajianPage'
import { ProfilePage } from './pages/ProfilePage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route
              index
              element={
                <PermissionRoute permission="dashboard.view">
                  <DashboardPage />
                </PermissionRoute>
              }
            />
            <Route
              path="kehadiran"
              element={
                <PermissionRoute permission="kehadiran.view">
                  <KehadiranPage />
                </PermissionRoute>
              }
            />
            <Route
              path="kategori-umur"
              element={
                <PermissionRoute permission="kategori_umur.view">
                  <KategoriUmurPage />
                </PermissionRoute>
              }
            />
            <Route
              path="kalender"
              element={
                <PermissionRoute permission="kalender.view">
                  <KalenderPage />
                </PermissionRoute>
              }
            />
            <Route
              path="jamaah"
              element={
                <PermissionRoute permission="jamaah.view">
                  <JamaahListPage />
                </PermissionRoute>
              }
            />
            <Route
              path="jamaah/new"
              element={
                <PermissionRoute permission="jamaah.create">
                  <JamaahFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="jamaah/:id/edit"
              element={
                <PermissionRoute permission="jamaah.update">
                  <JamaahFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="jamaah/:id/face"
              element={
                <PermissionRoute permission="jamaah.enroll_face">
                  <JamaahFaceEnrollPage />
                </PermissionRoute>
              }
            />
            <Route
              path="pengajian"
              element={
                <PermissionRoute permission="pengajian.view">
                  <PengajianPage />
                </PermissionRoute>
              }
            />
            <Route
              path="pengajian/new"
              element={
                <PermissionRoute permission="pengajian.create">
                  <PengajianFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="pengajian/:id/edit"
              element={
                <PermissionRoute permission="pengajian.update">
                  <PengajianFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="kegiatan"
              element={
                <PermissionRoute permission="kegiatan.view">
                  <KegiatanPage />
                </PermissionRoute>
              }
            />
            <Route
              path="kegiatan/new"
              element={
                <PermissionRoute permission="kegiatan.create">
                  <KegiatanFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="kegiatan/:id/edit"
              element={
                <PermissionRoute permission="kegiatan.update">
                  <KegiatanFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="absensi"
              element={
                <PermissionRoute permission="absensi.view">
                  <AbsensiPage />
                </PermissionRoute>
              }
            />
            <Route path="profil" element={<ProfilePage />} />
            <Route
              path="master/pusat"
              element={
                <PermissionRoute permission="pusat.view">
                  <MasterPusatPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/daerah"
              element={
                <PermissionRoute permission="daerah.view">
                  <MasterDaerahPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/desa"
              element={
                <PermissionRoute permission="desa.view">
                  <MasterDesaPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/kelompok"
              element={
                <PermissionRoute permission="kelompok.view">
                  <MasterKelompokPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/sub-kelompok"
              element={
                <PermissionRoute permission="sub_kelompok.view">
                  <MasterSubKelompokPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/lokasi"
              element={
                <PermissionRoute permission="lokasi.view">
                  <MasterLokasiPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/lokasi/new"
              element={
                <PermissionRoute permission="lokasi.create">
                  <MasterLokasiFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/lokasi/:id/edit"
              element={
                <PermissionRoute permission="lokasi.update">
                  <MasterLokasiFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/pemateri"
              element={
                <PermissionRoute permission="pemateri.view">
                  <MasterPemateriPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/pemateri/new"
              element={
                <PermissionRoute permission="pemateri.create">
                  <MasterPemateriFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/pemateri/:id/edit"
              element={
                <PermissionRoute permission="pemateri.update">
                  <MasterPemateriFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/pekerjaan"
              element={
                <PermissionRoute permission="pekerjaan.view">
                  <MasterPekerjaanPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/pekerjaan/new"
              element={
                <PermissionRoute permission="pekerjaan.create">
                  <MasterPekerjaanFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/pekerjaan/:id/edit"
              element={
                <PermissionRoute permission="pekerjaan.update">
                  <MasterPekerjaanFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/materi"
              element={
                <PermissionRoute permission="materi.view">
                  <MasterMateriPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/materi/new"
              element={
                <PermissionRoute permission="materi.create">
                  <MasterMateriFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/materi/:id/edit"
              element={
                <PermissionRoute permission="materi.update">
                  <MasterMateriFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/kategori-kegiatan"
              element={
                <PermissionRoute permission="kategori_kegiatan.view">
                  <MasterKategoriKegiatanPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/kategori-kegiatan/new"
              element={
                <PermissionRoute permission="kategori_kegiatan.create">
                  <MasterKategoriKegiatanFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/kategori-kegiatan/:id/edit"
              element={
                <PermissionRoute permission="kategori_kegiatan.update">
                  <MasterKategoriKegiatanFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/adm/negara"
              element={
                <PermissionRoute permission="adm_negara.view">
                  <MasterAdmNegaraPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/adm/provinsi"
              element={
                <PermissionRoute permission="adm_provinsi.view">
                  <MasterAdmProvinsiPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/adm/kabupaten-kota"
              element={
                <PermissionRoute permission="adm_kabupaten_kota.view">
                  <MasterAdmKabupatenKotaPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/adm/kecamatan"
              element={
                <PermissionRoute permission="adm_kecamatan.view">
                  <MasterAdmKecamatanPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/adm/desa-kelurahan"
              element={
                <PermissionRoute permission="adm_desa_kelurahan.view">
                  <MasterAdmDesaKelurahanPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/adm/kode-pos"
              element={
                <PermissionRoute permission="adm_kode_pos.view">
                  <MasterAdmKodePosPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/dapukan"
              element={
                <PermissionRoute permission="dapukan.view">
                  <MasterDapukanPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/menu"
              element={
                <PermissionRoute permission="menu.view">
                  <MasterMenuPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/fitur"
              element={
                <PermissionRoute permission="fitur.view">
                  <MasterFiturPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/hak-akses"
              element={
                <PermissionRoute permission="hak_akses.view">
                  <MasterHakAksesPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/matriks"
              element={
                <PermissionRoute permission="matriks.view">
                  <MasterMatriksPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/users"
              element={
                <PermissionRoute permission="users.view">
                  <MasterUsersPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/users/new"
              element={
                <PermissionRoute permission="users.create">
                  <MasterUsersFormPage />
                </PermissionRoute>
              }
            />
            <Route
              path="master/users/:id/edit"
              element={
                <PermissionRoute permission="users.update">
                  <MasterUsersFormPage />
                </PermissionRoute>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
