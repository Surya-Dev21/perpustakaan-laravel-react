
import { useEffect, useState } from 'react'
import AdminNavbar from '../../components/AdminNavbar.jsx'
import './style/KelolaPengguna.css'

const API = 'http://localhost:8000/api'

export default function KelolaPengguna() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'pengguna',
  })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API}/users`, {
        headers: { Accept: 'application/json' },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengambil data pengguna.')
      }

      setUsers(data.data || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Tidak bisa terhubung ke server.')
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch(`${API}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(
          data.message ||
            (data.errors
              ? Object.values(data.errors).flat().join(', ')
              : 'Gagal menambahkan pengguna.')
        )
        return
      }

      setForm({
        username: '',
        email: '',
        password: '',
        role: 'pengguna',
      })

      await loadUsers()
    } catch {
      setError('Tidak bisa terhubung ke server.')
    }
  }

  const handleEdit = (user) => {
    setError('')
    setEditingId(user.id)
    setEditForm({
      username: user.username ?? '',
      email: user.email ?? '',
      role: user.role ?? 'pengguna',
      password: '',
    })
  }

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async () => {
    setError('')

    const payload = { ...editForm }

    if (!payload.password) {
      delete payload.password
    }

    try {
      const res = await fetch(`${API}/users/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(
          data.message ||
            (data.errors
              ? Object.values(data.errors).flat().join(', ')
              : 'Gagal memperbarui data pengguna.')
        )
        return
      }

      setEditingId(null)
      setEditForm({})
      await loadUsers()
    } catch {
      setError('Tidak bisa terhubung ke server.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      return
    }

    setError('')

    try {
      const res = await fetch(`${API}/users/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Gagal menghapus pengguna.')
        return
      }

      if (editingId === id) {
        setEditingId(null)
        setEditForm({})
      }

      await loadUsers()
    } catch {
      setError('Tidak bisa terhubung ke server.')
    }
  }

  return (
    <>
      <AdminNavbar />

      <div className="users-page">
        <div className="users-header">
          <div>
            <h1>Kelola Pengguna</h1>
            <p>Kelola informasi dan akun pengguna perpustakaan.</p>
          </div>
        </div>

        {error && <div className="users-error">{error}</div>}

        <form className="users-form" onSubmit={handleAdd}>
          <input
            className="users-input"
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            className="users-input"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            className="users-input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <select
            className="users-select"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="pengguna">Pengguna</option>
            <option value="admin">Admin</option>
          </select>

          <button className="users-add-button" type="submit">
            <span>+</span> Tambah Pengguna
          </button>
        </form>

        <div className="users-content">
          <div className="users-content-header">
            <div>
              <h2>Daftar Pengguna</h2>
              <p>Jumlah pengguna: {users.length}</p>
            </div>
          </div>

          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Opsi</th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="users-empty">
                      Belum ada data pengguna.
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) =>
                    user.id === editingId ? (
                      <tr key={user.id} className="users-edit-row">
                        <td>{index + 1}</td>

                        <td>
                          <input
                            className="users-edit-input"
                            type="text"
                            name="username"
                            value={editForm.username}
                            onChange={handleEditChange}
                            required
                          />
                        </td>

                        <td>
                          <div>
                            <input
                              className="users-edit-input"
                              type="email"
                              name="email"
                              value={editForm.email}
                              onChange={handleEditChange}
                              required
                            />

                            <input
                              className="users-edit-input"
                              type="password"
                              name="password"
                              placeholder="Password baru (opsional)"
                              value={editForm.password}
                              onChange={handleEditChange}
                              style={{ marginTop: 6 }}
                            />
                          </div>
                        </td>

                        <td>
                          <select
                            className="users-edit-input"
                            name="role"
                            value={editForm.role}
                            onChange={handleEditChange}
                            required
                          >
                            <option value="pengguna">Pengguna</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        <td>
                          <div className="users-actions">
                            <button
                              className="users-save-button"
                              type="button"
                              onClick={handleSave}
                            >
                              Simpan
                            </button>

                            <button
                              className="users-cancel-button"
                              type="button"
                              onClick={() => {
                                setEditingId(null)
                                setEditForm({})
                              }}
                            >
                              Batal
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={user.id}>
                        <td>{index + 1}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`users-role ${
                              user.role === 'admin'
                                ? 'users-role-admin'
                                : ''
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <div className="users-actions">
                            <button
                              className="users-edit-button"
                              type="button"
                              onClick={() => handleEdit(user)}
                            >
                              Edit
                            </button>

                            <button
                              className="users-delete-button"
                              type="button"
                              onClick={() => handleDelete(user.id)}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
