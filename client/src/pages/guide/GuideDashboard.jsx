import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { 
  FaCalendarCheck, FaEnvelope, FaTrash, FaCheckCircle, FaUsers, 
  FaSearch, FaChartLine, FaWallet, FaUserEdit, FaImages, 
  FaSignOutAlt, FaThLarge, FaHistory, FaStar, FaPhoneAlt 
} from "react-icons/fa";

const GuideDashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  
  // View States
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, inquiries, finance, profile
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Business States (Public Profile)
  const [profileData, setProfileData] = useState({
    bio: "Certified local guide with experience in mountain trekking and historical city tours.",
    languages: ["English", "Spanish"],
    tags: ["Hiking", "History", "Photography"],
    price: 50
  });

  // Financial Ledger States
  const [finances] = useState({
    totalRevenue: 4500,
    pendingPayouts: 1200,
    transactions: [
      { id: "TX-9901", traveler: "John Doe", amount: 200, date: "2024-03-25", status: "Paid" },
      { id: "TX-9902", traveler: "Sarah Smith", amount: 450, date: "2024-03-28", status: "Pending" },
    ]
  });

  const fetchMessages = async () => {
    if (!currentUser?.email) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/guide-message/get-messages/${currentUser.email}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (error) {
      toast.error("Failed to sync data with server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [currentUser]);

  // Derived Analytics
  const unreadMessages = messages.filter(m => m.status === "unread");
  const approvedTours = messages.filter(m => m.status === "approved");

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* SIDEBAR NAVIGATION - The "Pro" Look */}
      <aside className="w-72 bg-slate-900 text-white hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <FaThLarge className="text-white text-sm" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">GuideHub<span className="text-emerald-500 text-3xl">.</span></h2>
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Management Suite</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: "overview", label: "Overview", icon: <FaThLarge /> },
            { id: "inquiries", label: "Inquiries", icon: <FaEnvelope />, count: unreadMessages.length },
            { id: "finance", label: "Financials", icon: <FaWallet /> },
            { id: "profile", label: "Public Brand", icon: <FaUserEdit /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                activeTab === item.id ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/50" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-emerald-400"}>
                  {item.icon}
                </span>
                <span className="font-semibold text-sm">{item.label}</span>
              </div>
              {item.count > 0 && (
                <span className="bg-emerald-400 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-black">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center gap-3">
             <img src={currentUser?.avatar} className="w-10 h-10 rounded-full border-2 border-emerald-500" alt="Guide" />
             <div className="overflow-hidden">
               <p className="text-xs font-bold truncate">{currentUser?.username}</p>
               <p className="text-[10px] text-slate-500 truncate">Verified Guide</p>
             </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        
        {/* VIEW: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="max-w-6xl mx-auto space-y-10">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Executive Summary</h1>
                <p className="text-slate-500 mt-2 font-medium">Monitoring your tour operations for this month.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <FaWallet size={80} />
                </div>
                <p className="text-slate-400 text-xs font-black uppercase mb-2">Net Revenue</p>
                <h3 className="text-4xl font-black text-slate-900">Rs.{finances.totalRevenue}</h3>
                <div className="mt-4 text-emerald-600 text-xs font-bold flex items-center gap-1">
                   <FaChartLine /> +14.2% from last month
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-xs font-black uppercase mb-2">Confirmed Tours</p>
                <h3 className="text-4xl font-black text-slate-900">{approvedTours.length}</h3>
                <p className="mt-4 text-slate-400 text-xs font-medium">8 tours pending completion</p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-xs font-black uppercase mb-2">Guide Reputation</p>
                <h3 className="text-4xl font-black text-slate-900 flex items-center gap-2">4.9 <FaStar className="text-amber-400 text-2xl" /></h3>
                <p className="mt-4 text-slate-400 text-xs font-medium">Based on 128 reviews</p>
              </div>
            </div>

            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-black text-slate-800 text-lg">Urgent Tasks</h3>
                <button className="text-emerald-600 text-xs font-bold hover:underline">View All Inquiries</button>
              </div>
              <div className="p-4 divide-y divide-slate-50">
                {unreadMessages.length === 0 ? (
                  <p className="p-8 text-center text-slate-400 text-sm">No critical alerts right now.</p>
                ) : (
                  unreadMessages.map(msg => (
                    <div key={msg._id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-all rounded-2xl cursor-pointer" onClick={() => setActiveTab("inquiries")}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                          {msg.userName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{msg.userName}</p>
                          <p className="text-xs text-slate-400">Sent a booking inquiry</p>
                        </div>
                      </div>
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full">NEW INQUIRY</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* VIEW: FINANCES */}
        {activeTab === "finance" && (
          <div className="max-w-5xl mx-auto space-y-8">
            <h2 className="text-3xl font-black text-slate-900">Earnings & Payouts</h2>
            
            <div className="bg-slate-900 text-white p-12 rounded-[40px] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-4">Current Balance</p>
                <h1 className="text-7xl font-black">Rs.{finances.pendingPayouts}</h1>
                <p className="text-slate-500 mt-4 text-sm max-w-xs">Funds are released 24 hours after a tour is marked as completed by both parties.</p>
              </div>
              <button className="bg-emerald-500 hover:bg-emerald-400 px-12 py-5 rounded-2xl font-black text-slate-900 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20">
                Request Payout
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 font-black text-slate-800">Transaction History</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black">
                    <tr>
                      <th className="px-8 py-5">Reference</th>
                      <th className="px-8 py-5">Guest Name</th>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {finances.transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5 font-mono text-xs text-slate-500 tracking-tighter">{tx.id}</td>
                        <td className="px-8 py-5 font-bold text-slate-800">{tx.traveler}</td>
                        <td className="px-8 py-5 text-slate-500 text-sm">{tx.date}</td>
                        <td className="px-8 py-5 text-right font-black text-slate-900">Rs.{tx.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PUBLIC BRAND EDITOR */}
        {activeTab === "profile" && (
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-black text-slate-900">Storefront Branding</h2>
            
            <div className="bg-white p-10 rounded-[35px] shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-center gap-8 pb-8 border-b border-slate-50">
                <div className="w-32 h-32 rounded-3xl bg-slate-100 border-4 border-white shadow-lg overflow-hidden relative group">
                   <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <FaImages className="text-white text-2xl" />
                   </div>
                   <img src={currentUser?.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900">{currentUser?.username}</h4>
                  <p className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest mt-1">Level 2 Guide • Verified</p>
                </div>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Professional Biography</label>
                  <textarea 
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    rows="5"
                    className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Standard Day Rate (Rs.)</label>
                    <input 
                      type="number"
                      value={profileData.price}
                      className="w-full p-5 bg-slate-50 border-none rounded-2xl font-black"
                      onChange={(e) => setProfileData({...profileData, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Primary Focus</label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.tags.map(tag => (
                        <span key={tag} className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => toast.success("Public profile successfully updated!")}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  Synchronize with Live Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: INQUIRIES */}
        {activeTab === "inquiries" && (
           <div className="max-w-5xl mx-auto space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-slate-900">Communication Hub</h2>
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="Search traveler name..." 
                    className="pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm w-80 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-5">
                {messages.filter(m => m.userName.toLowerCase().includes(searchTerm.toLowerCase())).map((msg) => (
                  <div 
                    key={msg._id} 
                    onClick={() => { setSelectedMessage(msg); setShowModal(true); }}
                    className={`p-8 rounded-[30px] border transition-all duration-300 cursor-pointer flex justify-between items-center group ${
                      msg.status === 'unread' ? 'bg-white border-emerald-400 shadow-xl shadow-emerald-500/5' : 'bg-white/60 border-slate-100 grayscale-[0.5]'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${msg.status === 'unread' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {msg.userName[0]}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">{msg.userName}</h4>
                        <p className="text-sm text-slate-400 font-medium">{msg.userEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${msg.status === 'unread' ? 'text-emerald-500' : 'text-slate-300'}`}>
                        {msg.status}
                      </p>
                      <p className="text-xs text-slate-400 font-bold">{new Date(msg.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        )}

      </main>

      {/* DETAIL MODAL OVERLAY */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
           <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedMessage.userName}</h2>
                    <p className="text-emerald-500 font-black text-xs uppercase tracking-widest mt-1">{selectedMessage.userEmail}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="bg-slate-50 text-slate-400 hover:text-slate-800 w-10 h-10 rounded-full flex items-center justify-center transition-colors">×</button>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-slate-50 p-6 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Date</p>
                    <p className="font-black text-slate-800">{selectedMessage.tourDate ? new Date(selectedMessage.tourDate).toLocaleDateString() : 'To be discussed'}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stay Duration</p>
                    <p className="font-black text-slate-800">{selectedMessage.tourDays} Total Days</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquiry Details</p>
                  <p className="text-slate-700 font-medium leading-relaxed bg-slate-50 p-6 rounded-3xl italic">
                    "{selectedMessage.message}"
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                   <button className="flex-1 bg-emerald-600 text-white py-5 rounded-[22px] font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all">Accept & Notify Guest</button>
                   <button className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-[22px] font-black hover:bg-slate-200 transition-all">Decline Inquiry</button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GuideDashboard;