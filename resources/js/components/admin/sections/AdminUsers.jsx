import { useEffect, useState } from "react";
import axios from "axios";
import { Users, Search, Loader2, Trash2, Edit2, Check, X, Shield, User } from "lucide-react";

const API = "http://127.0.0.1:8000/api/v1/admin";
const token = () => localStorage.getItem("admin_token");

export default function AdminUsers() {
    const [users, setUsers]     = useState([]);
    const [meta, setMeta]       = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState("");
    const [role, setRole]       = useState("");
    const [page, setPage]       = useState(1);
    const [editId, setEditId]   = useState(null);
    const [editRole, setEditRole] = useState("");
    const [saving, setSaving]   = useState(false);
    const [toast, setToast]     = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/users`, {
                headers: { Authorization: `Bearer ${token()}` },
                params: { search, role, page, per_page: 12 },
            });
            setUsers(res.data.data.data || []);
            setMeta(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, [search, role, page]);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

    const handleUpdateRole = async (id) => {
        setSaving(true);
        try {
            await axios.put(`${API}/users/${id}`, { role: editRole }, { headers: { Authorization: `Bearer ${token()}` } });
            showToast("Role pengguna diperbarui.");
            setEditId(null);
            fetchUsers();
        } catch (e) { showToast("Gagal memperbarui."); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Hapus pengguna "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        try {
            await axios.delete(`${API}/users/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
            showToast("Pengguna dihapus.");
            fetchUsers();
        } catch (e) { showToast("Gagal menghapus."); }
    };

    return (
        <div className="space-y-4">
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-xl text-sm">
                    {toast}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Cari nama atau email..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <select
                    value={role}
                    onChange={(e) => { setRole(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <option value="">Semua Role</option>
                    <option value="pengguna">Pengguna</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Pengguna</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Role</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Bergabung</th>
                                <th className="text-right px-4 py-3 font-semibold text-slate-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                                </td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-slate-400">Tidak ada pengguna.</td></tr>
                            ) : users.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {u.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-slate-800">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                                    <td className="px-4 py-3">
                                        {editId === u.id ? (
                                            <select
                                                value={editRole}
                                                onChange={(e) => setEditRole(e.target.value)}
                                                className="px-2 py-1 rounded-lg border border-blue-300 text-xs focus:outline-none"
                                            >
                                                <option value="pengguna">pengguna</option>
                                                <option value="admin">admin</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
                                                ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                                                {u.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                {u.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">
                                        {new Date(u.created_at).toLocaleDateString("id-ID")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            {editId === u.id ? (
                                                <>
                                                    <button onClick={() => handleUpdateRole(u.id)} disabled={saving}
                                                        className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200">
                                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => setEditId(null)}
                                                        className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => { setEditId(u.id); setEditRole(u.role); }}
                                                        className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(u.id, u.name)}
                                                        className="p-1.5 rounded-lg bg-red-100 text-red-500 hover:bg-red-200">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
                        <span>Halaman {meta.current_page} dari {meta.last_page} ({meta.total} pengguna)</span>
                        <div className="flex gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                                ← Prev
                            </button>
                            <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
