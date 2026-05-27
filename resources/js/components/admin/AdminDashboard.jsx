import { useState, useRef } from "react";
import {
    LayoutDashboard, Users, Shield, FileText, CreditCard,
    Hospital, Stethoscope, MessageSquare, Star, Calendar,
    Settings, LogOut, Menu, X, ChevronRight, Bell
} from "lucide-react";
import AdminOverview    from "./sections/AdminOverview";
import AdminUsers       from "./sections/AdminUsers";
import AdminPolicies    from "./sections/AdminPolicies";
import AdminClaims      from "./sections/AdminClaims";
import AdminTransactions from "./sections/AdminTransactions";
import AdminHospitals   from "./sections/AdminHospitals";
import AdminConsultations from "./sections/AdminConsultations";
import AdminFeedbacks   from "./sections/AdminFeedbacks";
import AdminRegistrations from "./sections/AdminRegistrations";
import AdminPackages    from "./sections/AdminPackages";
import ChatNotifToast   from "../ChatNotifToast";
import { useChatNotif } from "../useChatNotif";

const NAV = [
    { id: "overview",       label: "Overview",          icon: LayoutDashboard },
    { id: "users",          label: "Pengguna",           icon: Users },
    { id: "policies",       label: "Polis Asuransi",     icon: Shield },
    { id: "claims",         label: "Klaim",              icon: FileText },
    { id: "transactions",   label: "Transaksi",          icon: CreditCard },
    { id: "hospitals",      label: "Rumah Sakit",        icon: Hospital },
    { id: "consultations",  label: "Konsultasi Dokter",  icon: Stethoscope },
    { id: "registrations",  label: "Pendaftaran",        icon: Calendar },
    { id: "feedbacks",      label: "Feedback",           icon: Star },
    { id: "packages",       label: "Paket Asuransi",     icon: Settings },
];

export default function AdminDashboard({ admin, onLogout }) {
    const [active, setActive]       = useState("overview");
    const [sidebarOpen, setSidebar] = useState(false);

    // ── Chat Notifications ────────────────────────────────────────────
    const [chatToasts, setChatToasts] = useState([]);
    const toastCounter = useRef(0);

    const { unreadCount: chatUnread, clearAll: clearChatBadge } = useChatNotif({
        role: "admin",
        onNewMsg: (consultationId, msg, consultation) => {
            setChatToasts((prev) => [
                ...prev,
                {
                    id: ++toastCounter.current,
                    consultationId,
                    role: "admin",
                    senderName: consultation?.user?.name || "Pengguna",
                    message: msg.message,
                },
            ]);
        },
    });

    const ActiveSection = {
        overview:      AdminOverview,
        users:         AdminUsers,
        policies:      AdminPolicies,
        claims:        AdminClaims,
        transactions:  AdminTransactions,
        hospitals:     AdminHospitals,
        consultations: AdminConsultations,
        registrations: AdminRegistrations,
        feedbacks:     AdminFeedbacks,
        packages:      AdminPackages,
    }[active] || AdminOverview;

    const currentNav = NAV.find((n) => n.id === active);

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0`}
            >
                {/* Brand */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-black text-sm">MefaSafe</p>
                        <p className="text-xs text-slate-400">Admin Panel</p>
                    </div>
                    <button
                        onClick={() => setSidebar(false)}
                        className="ml-auto lg:hidden text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {NAV.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => {
                                setActive(id);
                                setSidebar(false);
                                if (id === "consultations") clearChatBadge();
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative
                                ${active === id
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {label}
                            {id === "consultations" && chatUnread > 0 && (
                                <span className="ml-auto min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {chatUnread > 99 ? "99+" : chatUnread}
                                </span>
                            )}
                            {active === id && !( id === "consultations" && chatUnread > 0) && (
                                <ChevronRight className="w-4 h-4 ml-auto" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* Admin info + logout */}
                <div className="border-t border-slate-700 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            {admin.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{admin.name}</p>
                            <p className="text-xs text-slate-400 truncate">{admin.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebar(false)}
                />
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar */}
                <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-4 flex items-center gap-4 flex-shrink-0">
                    <button
                        onClick={() => setSidebar(true)}
                        className="lg:hidden text-slate-500 hover:text-slate-900"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">{currentNav?.label}</h1>
                        <p className="text-xs text-slate-400 hidden sm:block">MefaSafe Admin Control Panel</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                            Online
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <ActiveSection />
                    {/* Chat notification toasts */}
                    <ChatNotifToast
                        toasts={chatToasts}
                        onDismiss={(id) => setChatToasts((prev) => prev.filter((t) => t.id !== id))}
                        onOpen={() => { setActive("consultations"); clearChatBadge(); }}
                    />
                </main>
            </div>
        </div>
    );
}
