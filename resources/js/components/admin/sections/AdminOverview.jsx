import { useEffect, useState } from "react";
import axios from "axios";
import {
    Users, Shield, FileText, CreditCard, Hospital,
    Stethoscope, Star, TrendingUp, TrendingDown, Loader2,
    AlertCircle, CheckCircle2, Clock
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";

const API = "http://127.0.0.1:8000/api/v1/admin";
const token = () => localStorage.getItem("admin_token");

const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminOverview() {
    const [data, setData]     = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/stats`, { headers: { Authorization: `Bearer ${token()}` } })
            .then((r) => setData(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    );

    if (!data) return <p className="text-red-500">Gagal memuat data.</p>;

    const statCards = [
        { label: "Total Pengguna",      value: data.total_users,        icon: Users,       color: "blue",   sub: "Pengguna aktif" },
        { label: "Total Polis",         value: data.total_policies,     icon: Shield,      color: "indigo", sub: `${data.active_policies} aktif` },
        { label: "Total Klaim",         value: data.total_claims,       icon: FileText,    color: "amber",  sub: `${data.pending_claims} pending` },
        { label: "Total Transaksi",     value: data.total_transactions, icon: CreditCard,  color: "green",  sub: "Semua transaksi" },
        { label: "Pendapatan Premi",    value: fmt(data.total_revenue), icon: TrendingUp,  color: "emerald",sub: "Premi masuk" },
        { label: "Total Klaim Keluar",  value: fmt(data.total_payout),  icon: TrendingDown,color: "red",    sub: "Klaim dibayar" },
        { label: "Rumah Sakit",         value: data.total_hospitals,    icon: Hospital,    color: "cyan",   sub: "Mitra RS" },
        { label: "Konsultasi",          value: data.total_consultations,icon: Stethoscope, color: "purple", sub: "Total sesi" },
        { label: "Rating Rata-rata",    value: `${data.avg_rating} ★`,  icon: Star,        color: "yellow", sub: "Dari feedback" },
        { label: "Pembayaran Pending",  value: data.pending_payments,   icon: Clock,       color: "orange", sub: "Menunggu verifikasi" },
    ];

    const colorMap = {
        blue: "bg-blue-100 text-blue-600",
        indigo: "bg-indigo-100 text-indigo-600",
        amber: "bg-amber-100 text-amber-600",
        green: "bg-green-100 text-green-600",
        emerald: "bg-emerald-100 text-emerald-600",
        red: "bg-red-100 text-red-600",
        cyan: "bg-cyan-100 text-cyan-600",
        purple: "bg-purple-100 text-purple-600",
        yellow: "bg-yellow-100 text-yellow-600",
        orange: "bg-orange-100 text-orange-600",
    };

    // Pie data for claims
    const claimPie = Object.entries(data.claims_by_status || {}).map(([name, value]) => ({ name, value }));
    const policyPie = Object.entries(data.policies_by_type || {}).map(([name, value]) => ({ name, value }));

    // Bar chart for monthly revenue
    const barData = (data.monthly_revenue || []).map((m) => ({
        month: m.month,
        Premi: Number(m.revenue),
        Klaim: Number(m.payout),
    }));

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {statCards.map(({ label, value, icon: Icon, color, sub }) => (
                    <div key={label} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <p className="text-xl font-black text-slate-900 leading-tight">{value}</p>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Bar chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Pendapatan vs Klaim (6 Bulan)</h3>
                    {barData.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-10">Belum ada data transaksi.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={barData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}jt`} />
                                <Tooltip formatter={(v) => fmt(v)} />
                                <Bar dataKey="Premi" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Klaim" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Pie charts */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-3 text-sm">Status Klaim</h3>
                        {claimPie.length === 0 ? (
                            <p className="text-slate-400 text-xs text-center py-6">Belum ada klaim.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={130}>
                                <PieChart>
                                    <Pie data={claimPie} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value">
                                        {claimPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-3 text-sm">Polis per Tipe</h3>
                        {policyPie.length === 0 ? (
                            <p className="text-slate-400 text-xs text-center py-6">Belum ada polis.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={130}>
                                <PieChart>
                                    <Pie data={policyPie} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value">
                                        {policyPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
