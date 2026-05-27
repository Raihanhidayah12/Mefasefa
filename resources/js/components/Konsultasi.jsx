import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { 
    Stethoscope, Calendar, Clock, Video, MessageSquare, 
    ChevronLeft, Send, Search, Star, Shield, AlertCircle, 
    MoreVertical, Info, CheckCircle2, Trash2, X
} from "lucide-react";

export default function Konsultasi({ user }) {
    const [activeTab, setActiveTab] = useState("doctors"); // 'doctors', 'history'
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [activeChat, setActiveChat] = useState(null); // the consultation object
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null); // consultation to delete
    const [deleting, setDeleting] = useState(false);

    const messagesEndRef = useRef(null);

    const [doctors, setDoctors] = useState([]);

    const fetchDoctors = async () => {
        try {
            const res = await axios.get(`/api/v1/doctors`);
            if (res.data.data) {
                // Map the backend structure to our UI structure
                const formattedDoctors = res.data.data.map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    specialist: doc.specialist,
                    rating: 4.8 + (Math.random() * 0.2), // Mock rating since DB doesn't have it
                    exp: Math.floor(Math.random() * 15 + 5) + " Tahun", // Mock experience
                    status: doc.availability === "available" ? "Tersedia" : "Sibuk",
                    originalData: doc
                }));
                setDoctors(formattedDoctors);
            }
        } catch (error) {
            console.error("Failed to fetch doctors", error);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchConsultations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("mefasafe_token");
            const res = await axios.get(`/api/v1/doctor-consultations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.data) {
                // filter by current user
                const userConsults = res.data.data.filter(c => c.user_id === user.id);
                setConsultations(userConsults);
            }
        } catch (error) {
            console.error("Failed to fetch consultations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "history" || activeChat) {
            fetchConsultations();
        }
    }, [activeTab]);

    const bookConsultation = async (type) => {
        if (!selectedDoctor) return;
        try {
            const token = localStorage.getItem("mefasafe_token");
            const res = await axios.post(`/api/v1/doctor-consultations`, {
                user_id: user.id,
                doctor_name: selectedDoctor.name,
                specialist_type: selectedDoctor.specialist,
                consultation_type: type,
                payment_status: "pending",
                session_duration_minutes: 45
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 201) {
                setSelectedDoctor(null);
                setActiveTab("history");
                alert("Konsultasi berhasil dibuat! Admin/Dokter akan segera menghubungi Anda.");
            }
        } catch (error) {
            console.error("Booking error", error);
            alert("Gagal membuat konsultasi.");
        }
    };

    const fetchMessages = async (consultationId) => {
        try {
            const token = localStorage.getItem("mefasafe_token");
            const res = await axios.get(`/api/v1/doctor-consultations/${consultationId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data.data || []);
            scrollToBottom();
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        try {
            const token = localStorage.getItem("mefasafe_token");
            const msg = newMessage;
            setNewMessage(""); // optimistic clear

            await axios.post(`/api/v1/doctor-consultations/${activeChat.id}/messages`, {
                sender: "user",
                message: msg
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Re-fetch messages
            fetchMessages(activeChat.id);

            // Mock auto reply from admin after 2 seconds
            setTimeout(async () => {
                await axios.post(`http://127.0.0.1:8000/api/v1/doctor-consultations/${activeChat.id}/messages`, {
                    sender: "admin",
                    message: "Baik, dokter akan segera merespon keluhan Anda. Mohon tunggu sebentar ya."
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (activeChat) fetchMessages(activeChat.id);
            }, 2000);

        } catch (error) {
            console.error("Failed to send message", error);
            alert("Gagal mengirim pesan.");
        }
    };

    const openChat = (consultation) => {
        setActiveChat(consultation);
        fetchMessages(consultation.id);
    };

    const deleteConsultation = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const token = localStorage.getItem("mefasafe_token");
            await axios.delete(`/api/v1/doctor-consultations/${deleteTarget.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConsultations(prev => prev.filter(c => c.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (error) {
            console.error("Failed to delete consultation", error);
            alert("Gagal menghapus konsultasi.");
        } finally {
            setDeleting(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    // Render Chat View
    if (activeChat) {
        return (
            <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 md:p-6 text-white flex items-center justify-between shadow-lg z-10">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setActiveChat(null)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold backdrop-blur-sm border-2 border-white/50">
                                    <Stethoscope className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-purple-600"></div>
                            </div>
                            <div>
                                <h2 className="font-bold text-lg leading-tight">{activeChat.doctor_name}</h2>
                                <p className="text-white/80 text-sm flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    {activeChat.specialist_type}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                            <Video className="w-5 h-5" />
                        </button>
                        <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 space-y-4">
                    <div className="text-center">
                        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                            Konsultasi Dimulai
                        </span>
                    </div>
                    
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                            <MessageSquare className="w-16 h-16 mb-4" />
                            <p>Belum ada pesan. Mulai sapa dokter Anda!</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={msg.id || idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm relative group ${
                                msg.sender === 'user' 
                                ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-br-sm' 
                                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                            }`}>
                                <p className="text-sm md:text-base leading-relaxed">{msg.message}</p>
                                <span className={`text-[10px] block mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <form onSubmit={sendMessage} className="flex gap-2">
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Ketik keluhan Anda di sini..."
                            className="flex-1 bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        <button 
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center min-w-[50px]"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                    <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-semibold mb-4 border border-white/20">
                                <Stethoscope className="w-4 h-4 text-purple-300" />
                                <span className="text-purple-100">Layanan Medis MefaSafe</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                                Konsultasi Dokter <br/> 
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">Tanpa Antre</span>
                            </h1>
                            <p className="text-purple-100/80 max-w-xl text-lg">
                                Dapatkan penanganan medis terbaik dari ujung jari Anda. Konsultasi langsung dengan dokter spesialis berpengalaman.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl w-full md:w-fit border border-gray-100 shadow-sm">
                    <button 
                        onClick={() => setActiveTab("doctors")}
                        className={`flex-1 md:w-48 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'doctors' ? 'bg-white shadow-md text-purple-700' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Cari Dokter
                    </button>
                    <button 
                        onClick={() => setActiveTab("history")}
                        className={`flex-1 md:w-48 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'history' ? 'bg-white shadow-md text-purple-700' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Riwayat Konsultasi
                    </button>
                </div>

                {/* Content: Doctors List */}
                {activeTab === "doctors" && (
                    <div className="space-y-6">
                        {/* Search & Filter */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Cari nama dokter atau spesialisasi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                                />
                            </div>
                            <button className="bg-white border border-gray-200 px-6 py-4 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2">
                                <Clock className="w-5 h-5" />
                                Tersedia Hari Ini
                            </button>
                        </div>

                        {/* Doctors Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {doctors.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.specialist.toLowerCase().includes(searchQuery.toLowerCase())).map((doc) => (
                                <div key={doc.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-500 group">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-inner group-hover:scale-105 transition-transform duration-500"
                                                style={{ background: `hsl(${(doc.name.charCodeAt(3) || 200) * 5 % 360}, 65%, 50%)` }}>
                                                {doc.name.split(' ').slice(1, 3).map(w => w[0]).join('').toUpperCase() || doc.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${doc.status === 'Tersedia' ? 'bg-green-500' : 'bg-amber-500'}`}>
                                                {doc.status === 'Tersedia' && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight">{doc.name}</h3>
                                            <p className="text-purple-600 text-sm font-medium mb-2">{doc.specialist}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                    {doc.rating}
                                                </span>
                                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    {doc.exp}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => setSelectedDoctor(doc)}
                                            className="col-span-2 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 font-semibold py-3 rounded-xl hover:from-purple-600 hover:to-blue-600 hover:text-white transition-all duration-300 border border-purple-100 hover:border-transparent flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            Mulai Konsultasi
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content: History */}
                {activeTab === "history" && (
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Konsultasi Anda</h2>
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : consultations.length === 0 ? (
                            <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum ada konsultasi</h3>
                                <p className="text-gray-500">Anda belum pernah melakukan konsultasi dokter. Mulai cari dokter sekarang!</p>
                                <button 
                                    onClick={() => setActiveTab("doctors")}
                                    className="mt-6 px-6 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-all"
                                >
                                    Cari Dokter
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {consultations.map(c => (
                                    <div key={c.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-all duration-300 gap-4 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center border border-purple-200">
                                                <Stethoscope className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">{c.doctor_name}</h4>
                                                <p className="text-gray-500 text-sm flex items-center gap-2">
                                                    <span>{c.specialist_type}</span>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <span className="capitalize">{c.consultation_type}</span>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col md:items-end gap-2">
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className={`px-3 py-1 rounded-full font-medium text-xs border ${
                                                    c.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    c.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                    {c.status === 'waiting_approval' ? 'Menunggu' : 
                                                     c.status === 'approved' ? 'Berlangsung' : 
                                                     c.status === 'completed' ? 'Selesai' : c.status}
                                                </span>
                                                <span className="text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(c.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mt-2">
                                                {(c.status === 'approved' || c.status === 'waiting_approval') && (
                                                    <button 
                                                        onClick={() => openChat(c)}
                                                        className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:shadow-md transition-all text-sm flex items-center gap-2"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        Buka Chat
                                                    </button>
                                                )}
                                                {c.status === 'completed' && (
                                                    <button 
                                                        onClick={() => openChat(c)}
                                                        className="px-5 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all text-sm flex items-center gap-2"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        Lihat Chat
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setDeleteTarget(c)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Hapus konsultasi"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Booking Modal Overlay - Portal ke document.body */}
            {selectedDoctor && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white text-center">
                            <h3 className="text-xl font-bold">Konfirmasi Konsultasi</h3>
                            <p className="text-purple-100 text-sm mt-1">Pilih metode konsultasi Anda</p>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0"
                                    style={{ background: `hsl(${(selectedDoctor.name.charCodeAt(3) || 200) * 5 % 360}, 65%, 50%)` }}>
                                    {selectedDoctor.name.split(' ').slice(1, 3).map(w => w[0]).join('').toUpperCase() || selectedDoctor.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{selectedDoctor.name}</h4>
                                    <p className="text-purple-600 text-sm">{selectedDoctor.specialist}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-purple-800">
                                        Durasi sesi konsultasi adalah <strong className="font-bold">45 menit</strong>. Admin/Dokter akan segera merespon setelah pengajuan dibuat.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button 
                                        onClick={() => bookConsultation("chat")}
                                        className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                                    >
                                        <MessageSquare className="w-8 h-8 text-gray-400 group-hover:text-purple-600 mb-2 transition-colors" />
                                        <span className="font-semibold text-gray-700 group-hover:text-purple-700">Chat</span>
                                    </button>
                                    <button 
                                        onClick={() => bookConsultation("call")}
                                        className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group opacity-50 cursor-not-allowed"
                                        title="Fitur ini akan segera hadir"
                                    >
                                        <Video className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="font-semibold text-gray-700">Video Call</span>
                                        <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full mt-1">Segera</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 flex gap-3">
                            <button 
                                onClick={() => setSelectedDoctor(null)}
                                className="flex-1 py-3 px-4 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Confirmation Modal - Portal ke document.body */}
            {deleteTarget && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white text-center">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Trash2 className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold">Hapus Konsultasi?</h3>
                            <p className="text-red-100 text-sm mt-1">Tindakan ini tidak dapat dibatalkan</p>
                        </div>
                        <div className="p-6">
                            <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
                                <p className="font-semibold text-gray-900">{deleteTarget.doctor_name}</p>
                                <p className="text-sm text-gray-500">{deleteTarget.specialist_type} &bull; {deleteTarget.consultation_type}</p>
                            </div>
                            <p className="text-sm text-gray-600 text-center mb-5">
                                Semua riwayat pesan dalam konsultasi ini juga akan dihapus secara permanen.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    disabled={deleting}
                                    className="flex-1 py-3 px-4 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Batal
                                </button>
                                <button
                                    onClick={deleteConsultation}
                                    disabled={deleting}
                                    className="flex-1 py-3 px-4 font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menghapus...</>
                                    ) : (
                                        <><Trash2 className="w-4 h-4" /> Hapus</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
