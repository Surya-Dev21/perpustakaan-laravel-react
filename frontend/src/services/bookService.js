const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const bookService = {
  // Ambil daftar buku dengan filter, search, sort, pagination
  async getBooks(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });

    const res = await fetch(`${API_BASE_URL}/books?${query.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal mengambil data buku');
    return data;
  },

  // Ambil detail buku berdasarkan ID
  async getBookById(id) {
    const res = await fetch(`${API_BASE_URL}/books/${id}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal mengambil detail buku');
    return data;
  },

  // Tambah buku baru
  async createBook(bookData) {
    const res = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(bookData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : 'Gagal menambahkan buku'));
    }
    return data;
  },

  // Ubah informasi buku
  async updateBook(id, bookData) {
    const res = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(bookData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : 'Gagal memperbarui buku'));
    }
    return data;
  },

  // Perbarui stok cepat
  async updateStock(id, stok) {
    const res = await fetch(`${API_BASE_URL}/books/${id}/stok`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ stok: Number(stok) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memperbarui stok');
    return data;
  },

  // Hapus buku
  async deleteBook(id) {
    const res = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menghapus buku');
    return data;
  },

  // Ambil statistik admin dashboard
  async getDashboardStats() {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal mengambil data dashboard');
    return data;
  },
};
