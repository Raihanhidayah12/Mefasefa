import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Edit2, Check, X, Shield } from "lucide-react";

const API = "http://127.0.0.1:8000/api/v1/admin";
const token = () => localStorage.getItem("admin_token");
const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

const TYPE_COLOR = {
    jiwa:      "bg-purple-100 text-purple-700",
    kesehatan: "bg-blue-100 text-blue-700",
    kendaraan: "bg-amber-100 text-amber-700",
};

export default function AdminPackages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [editId, setEditId]     = useState(null);
    const [editData, setEditData] = useState({});
    const [saving, setSaving]     = useState(false);
    const [toast, setToast]       = useState("");

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/packages`, { headers: { Authorization: `Bearer ${token()}` } });
            setPackages(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPackages(); }, []);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

    const startEdit = (pkg) => {
        setEditId(pkg.id);
        setEditData({
            label:          pkg.label,
            description:    pkg.description,
            coverage_limit: pkg.coverage_limit,
            premium_amount: pkg.premium_amount,
        });
    };

    const handleSave = async (id) => {
        setSaving(true);
        try {
            await axios.put(`${API}/packages/${id}`, editData, { headers: { Authorization: `Bearer ${token()}` } });
            showToast("Paket asuransi diperbarui.");
            setEditId(null);
            fetchPackages();
        } catch (e) { showToast("Gagal menyimpan."); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
    );

    return (
        <div className="space-y-4">
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-xl text-sm">{toast}</div>
            )}

            <p className="text-sm text-slate-500">Kelola paket asuransi yang tersedia untuk pengguna.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${TYPE_COLOR[pkg.type] || "bg-slate-100 text-slate-600"}`}>
                                    {pkg.type}
                                </span>
                                {editId === pkg.id ? (
                                    <input
                                        value={editData.label}
                                        onChange={(e) => setEditData({ ...editData, label: e.target.value })}
                                        className="block w-full text-lg font-black text-slate-900 border-b border-blue-300 focus:outline-none bg-transparent"
                                    />
                                ) : (
                                    <h3 className="text-lg font-black text-slate-900">{pkg.label}</h3>
                                )}
                            </div>
                            <div className="flex gap-1">
                                {editId === pkg.id ? (
                                    <>
                                        <button onClick={() => handleSave(pkg.id)} disabled={saving}
                                            className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200">
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => setEditId(null)}
                                            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => startEdit(pkg)}
                                        className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {editId === pkg.id ? (
                            <textarea
                                value={editData.description}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                rows={3}
                                className="w-full text-sm text-slate-600 border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-3"
                            />
                        ) : (
                            <p className="text-sm text-slate-500 mb-4 leading-relaxed">{pkg.description}</p>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Limit Klaim</span>
                                {editId === pkg.id ? (
                                    <input type="number" value={editData.coverage_limit}
                                        onChange={(e) => setEditData({ ...editData, coverage_limit: e.target.value })}
                                        className="text-sm font-bold text-slate-900 border-b border-blue-300 focus:outline-none bg-transparent text-right w-36" />
                                ) : (
                                    <span className="text-sm font-bold text-slate-900">{fmt(pkg.coverage_limit)}</span>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Premi / Bulan</span>
                                {editId === pkg.id ? (
                                    <input type="number" value={editData.premium_amount}
                                        onChange={(e) => setEditData({ ...editData, premium_amount: e.target.value })}
                                        className="text-sm font-bold text-blue-600 border-b border-blue-300 focus:outline-none bg-transparent text-right w-36" />
                                ) : (
                                    <span className="text-sm font-bold text-blue-600">{fmt(pkg.premium_amount)}</span>
                                )}
                            </div>
                        </div>

                        {/* Benefits */}
                        {pkg.benefits && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs font-semibold text-slate-500 mb-2">Manfaat:</p>
                                <ul className="space-y-1">
                                    {(Array.isArray(pkg.benefits) ? pkg.benefits : JSON.parse(pkg.benefits || "[]")).map((b, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                            <Shield className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
