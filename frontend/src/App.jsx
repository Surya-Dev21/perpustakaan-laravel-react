import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login.jsx'
import Register from './pages/Auth/Register.jsx';
import KelolaBuku from './pages/admin/KelolaBuku.jsx';
import KelolaPengguna from './pages/Admin/KelolaPengguna.jsx';
import BookForm from "./pages/Admin/BookForm.jsx";
import Katalog from './pages/User/Katalog.jsx';
import DetailBuku from './pages/User/DetailBuku.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/buku" element={<KelolaBuku />} />
      <Route path="/admin/buku/tambah" element={<BookForm />} />
      <Route path="/katalog" element={<Katalog />} />
      <Route path="/buku/:id" element={<DetailBuku />} />
      <Route path="/admin/pengguna" element={<KelolaPengguna />} />
      <Route path="/dipinjam" element={<h1>Dipinjam</h1>} />
      <Route path="/riwayatPeminjaman" element={<h1>Riwayat Peminjaman</h1>} />
      <Route path="/admin/peminjaman" element={<h1>Kelola Peminjaman</h1>} />
      <Route path="/admin/pengembalian" element={<h1>Kelola Pengembalian</h1>} />
      <Route path="/admin/riwayat" element={<h1>Riwayat Transaksi</h1>} />
    </Routes>
  );
}