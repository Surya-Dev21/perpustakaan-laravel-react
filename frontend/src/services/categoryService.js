const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const categoryService = {
  async getCategories() {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal mengambil kategori');
    return data;
  },

  async createCategory(nama_kategori) {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ nama_kategori }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menambahkan kategori');
    return data;
  },

  async updateCategory(id, nama_kategori) {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ nama_kategori }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memperbarui kategori');
    return data;
  },

  async deleteCategory(id) {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menghapus kategori');
    return data;
  },
};
