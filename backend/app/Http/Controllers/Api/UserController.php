<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('username', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Data pengguna berhasil diambil',
            'data'    => $query->orderBy('id')->get(['id', 'username', 'email', 'role']),
        ]);
    }

    public function show(string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Pengguna tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Data pengguna berhasil diambil',
            'data'    => [
                'id'       => $user->id,
                'username' => $user->username,
                'email'    => $user->email,
                'role'     => $user->role,
            ],
        ]);
    }

    public function store(Request $request)
    {
        foreach (['username', 'email', 'password', 'role'] as $field) {
            if (!$request->filled($field)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Lengkapi data',
                ], 400);
            }
        }

        if (!in_array($request->role, ['admin', 'pengguna'])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Role tidak valid',
            ], 422);
        }

        if (User::where('email', $request->email)->exists()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Email sudah digunakan',
            ], 409);
        }

        $user = User::create([
            'username' => $request->username,
            'email'    => $request->email,
            'password' => $request->password,
            'role'     => $request->role,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Pengguna berhasil ditambahkan',
            'data'    => [
                'id'       => $user->id,
                'username' => $user->username,
                'email'    => $user->email,
                'role'     => $user->role,
            ],
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Pengguna tidak ditemukan',
            ], 404);
        }

        foreach (['username', 'email', 'role'] as $field) {
            if (!$request->filled($field)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Lengkapi data',
                ], 400);
            }
        }

        if (!in_array($request->role, ['admin', 'pengguna'])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Role tidak valid',
            ], 422);
        }

        $kembar = User::where('email', $request->email)->where('id', '!=', $id)->exists();
        if ($kembar) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Email sudah digunakan',
            ], 409);
        }

        $user->username = $request->username;
        $user->email    = $request->email;
        $user->role     = $request->role;

        if ($request->filled('password')) {
            $user->password = $request->password;
        }

        $user->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Data pengguna berhasil diperbarui',
            'data'    => [
                'id'       => $user->id,
                'username' => $user->username,
                'email'    => $user->email,
                'role'     => $user->role,
            ],
        ], 200);
    }

    public function destroy(string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Pengguna tidak ditemukan',
            ], 404);
        }

        $aktif = Peminjaman::where('user_id', $id)
            ->whereNull('tgl_pengembalian')
            ->exists();

        if ($aktif) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Peminjaman masih aktif',
            ], 409);
        }

        if (Peminjaman::where('user_id', $id)->exists()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Pengguna memiliki riwayat peminjaman dan tidak dapat dihapus',
            ], 409);
        }

        $user->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Pengguna berhasil dihapus',
        ], 200);
    }
}
