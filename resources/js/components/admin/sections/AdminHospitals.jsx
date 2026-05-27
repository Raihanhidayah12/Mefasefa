import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Loader2, Hospital, MapPin, Phone, Stethoscope } from "lucide-react";

const API = "http://127.0.0.1:8000/api/v1/admin";
const token = () => localStorage.getItem("admin_token");

const TYPE_LABEL = { umum: "Umum", swasta: "Swasta", khusus: "Khusus", puskesmas: "Puskesmas" };
const TYPE_COLOR = {
    umum:      "bg-blue-100 text-blue-700",
    swasta:    "bg-purple-100 text-purple-700",
    khusus:    "bg-amber-100 text-amber-700",
    puskesmas: "bg-green-100 text-green-700",
};

export default function AdminHospitals() {
    const [hospitals, setHospitals] = useState([]);
    const [meta, setMeta]           = useState({});
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState("");
    const [page, setPage]           = useState(1);

    const fetchHospitals = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/hospitals`, {
                headers: { Authorization: `Bearer ${token()}` },
                params: { search, page, per_page: 12 },
            });
            setHospitals(res.data.data.data || []);
            setMeta(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchHospitals(); }, [search, page]);

    return (
        <div className="space-y-4">
            {/* Filter */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Cari nama atau kota..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
            </div>

            {/* Cards */}
            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : hospitals.length === 0 ? (
                <div className="text-center py-16 text-slate-400">Tidak ada rumah sakit.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hospitals.map((h) => (
                        <div key={h.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Hospital className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-900 text-sm leading-tight">{h.name}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLOR[h.type] || "bg-slate-100 text-slate-600"}`}>
                                        {TYPE_LABEL[h.type] || h.type}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5 text-xs text-slate-500">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                                    <span>{h.address}, {h.city}</span>
                                </div>
                                {h.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                                        <span>{h.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                                    <span>{h.doctors_count || 0} dokter terdaftar</span>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${h.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                                    {h.is_active ? "Aktif" : "Nonaktif"}
                                </span>
                                {h.is_partner && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">Mitra</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {meta.last_page > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Halaman {meta.current_page} dari {meta.last_page} ({meta.total} RS)</span>
                    <div className="flex gap-2">
                        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 bg-white">← Prev</button>
                        <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 bg-white">Next →</button>
                    </div>
                </div>
            )}
        </div>
    );
}
