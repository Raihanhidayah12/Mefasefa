import { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const STATUS_CONFIG = {
  pending: { color: "bg-amber-100 text-amber-700", icon: AlertCircle },
  approved: { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { color: "bg-red-100 text-red-700", icon: XCircle },
  partial: { color: "bg-blue-100 text-blue-700", icon: AlertCircle },
};

export default function Klaim({ user }) {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const token = localStorage.getItem("mefasafe_token");

  useEffect(() => {
    const fetch = async () => {
      if (!user?.id) return;
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/v1/claims`, {
          params: { user_id: user.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.data) setClaims(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.id, token]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-500" />
          Klaim Saya
        </h1>
        <p className="text-sm text-slate-500 mt-1">Daftar pengajuan klaim Anda dan status verifikasinya</p>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="font-semibold">Belum ada pengajuan klaim</p>
              <p className="text-sm mt-1">Ajukan klaim jika Anda butuh penggantian biaya</p>
            </div>
          ) : (
            claims.map((c) => {
              const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;

              return (
                <div key={c.id} className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Pengajuan Klaim</p>
                        <p className="text-sm text-slate-600">Rp {Number(c.claim_amount).toLocaleString('id-ID')}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(c.created_at).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full ${statusCfg.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-xs font-semibold">{c.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-slate-700">{c.description}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
