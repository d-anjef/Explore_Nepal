import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { 
  FaCalendarCheck, FaEnvelope, FaTrash, FaCheckCircle, FaUsers, 
  FaSearch, FaChartLine, FaWallet, FaUserEdit, FaImages, 
  FaSignOutAlt, FaThLarge, FaHistory, FaStar, FaPhoneAlt,
  FaRoute, FaTools, FaHiking, FaPlus
} from "react-icons/fa";

const GuideDashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  
  // View States
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Business States (Updated to match your new Schema)
  const [profileData, setProfileData] = useState({
    bio: "Certified local guide with experience in mountain trekking and historical city tours.",
    price: 50,
    expertiseAreas: ["Trekking", "Cultural Tours", "Photography"],
    signatureRoutes: ["Everest Base Camp", "Annapurna Circuit"],
    gearList: ["First Aid Kit", "GPS Tracker"],
  });

  // Helper to handle adding tags to arrays
  const handleAddTag = (field, value) => {
    if (!value.trim()) return;
    if (profileData[field].includes(value)) {
      toast.error("Already added!");
      return;
    }
    setProfileData({ ...profileData, [field]: [...profileData[field], value] });
  };

  const handleRemoveTag = (field, index) => {
    const updatedList = profileData[field].filter((_, i) => i !== index);
    setProfileData({ ...profileData, [field]: updatedList });
  };

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
      {/* SIDEBAR NAVIGATION */}
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
            { id: "profile", label: "Elite Portfolio", icon: <FaUserEdit /> },
            { id: "finance", label: "Financials", icon: <FaWallet /> },
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
               <p className="text-[10px] text-slate-500 truncate">Verified Professional</p>
             </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        
        {/* VIEW: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="max-w-6xl mx-auto space-y-10">
            <header>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Executive Summary</h1>
              <p className="text-slate-500 mt-2 font-medium">Your tour operations at a glance.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-xs font-black uppercase mb-2">Net Revenue</p>
                <h3 className="text-4xl font-black text-slate-900">Rs.4,500</h3>
                <div className="mt-4 text-emerald-600 text-xs font-bold flex items-center gap-1">
                   <FaChartLine /> +14.2% Growth
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-xs font-black uppercase mb-2">Active Tours</p>
                <h3 className="text-4xl font-black text-slate-900">{approvedTours.length}</h3>
                <p className="mt-4 text-slate-400 text-xs font-medium">Real-time status</p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-xs font-black uppercase mb-2">Public Rating</p>
                <h3 className="text-4xl font-black text-slate-900 flex items-center gap-2">4.9 <FaStar className="text-amber-400 text-2xl" /></h3>
                <p className="mt-4 text-slate-400 text-xs font-medium">128 Verified Reviews</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ELITE PORTFOLIO EDITOR (Updated Section) */}
        {activeTab === "profile" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900">Elite Portfolio Manager</h2>
                    <p className="text-slate-500 font-medium">Update your expertise, gear, and signature routes.</p>
                </div>
                <button 
                  onClick={() => toast.success("Portfolio synchronized!")}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  Save All Changes
                </button>
            </div>
            
            <div className="bg-white p-10 rounded-[35px] shadow-sm border border-slate-100 space-y-10">
              
              {/* Bio & Price */}
              <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Professional Bio</label>
                    <textarea 
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        className="w-full p-6 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700"
                        rows="4"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Day Rate (Rs.)</label>
                    <input 
                        type="number"
                        value={profileData.price}
                        onChange={(e) => setProfileData({...profileData, price: e.target.value})}
                        className="w-full p-6 bg-slate-50 border-none rounded-3xl font-black text-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
              </div>

              {/* Dynamic Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* 1. Expertise Areas */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest ml-2">
                    <FaHiking className="text-emerald-500" /> My Specialties
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[2rem] space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {profileData.expertiseAreas.map((item, i) => (
                            <span key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-2">
                                {item} <FaTrash onClick={() => handleRemoveTag('expertiseAreas', i)} className="text-red-400 cursor-pointer hover:text-red-600" />
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input id="expInput" type="text" placeholder="Add specialty..." className="flex-1 bg-white px-4 py-2 rounded-xl text-xs outline-none" onKeyDown={(e) => e.key === 'Enter' && (handleAddTag('expertiseAreas', e.target.value), e.target.value = '')} />
                    </div>
                  </div>
                </div>

                {/* 2. Signature Routes */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest ml-2">
                    <FaRoute className="text-blue-500" /> Signature Routes
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[2rem] space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {profileData.signatureRoutes.map((item, i) => (
                            <span key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-2">
                                {item} <FaTrash onClick={() => handleRemoveTag('signatureRoutes', i)} className="text-red-400 cursor-pointer hover:text-red-600" />
                            </span>
                        ))}
                    </div>
                    <input type="text" placeholder="Add route..." className="w-full bg-white px-4 py-2 rounded-xl text-xs outline-none" onKeyDown={(e) => e.key === 'Enter' && (handleAddTag('signatureRoutes', e.target.value), e.target.value = '')} />
                  </div>
                </div>

                {/* 3. Gear List */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest ml-2">
                    <FaTools className="text-orange-500" /> Professional Gear
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[2rem] space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {profileData.gearList.map((item, i) => (
                            <span key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-2">
                                {item} <FaTrash onClick={() => handleRemoveTag('gearList', i)} className="text-red-400 cursor-pointer hover:text-red-600" />
                            </span>
                        ))}
                    </div>
                    <input type="text" placeholder="Add gear item..." className="w-full bg-white px-4 py-2 rounded-xl text-xs outline-none" onKeyDown={(e) => e.key === 'Enter' && (handleAddTag('gearList', e.target.value), e.target.value = '')} />
                  </div>
                </div>

                {/* 4. Tour History Preview (Stats) */}
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest ml-2">
                    <FaCheckCircle className="text-emerald-500" /> Achievement Metrics
                  </div>
                  <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex justify-around">
                      <div className="text-center">
                          <p className="text-2xl font-black">120+</p>
                          <p className="text-[9px] text-slate-400 uppercase font-bold">Groups</p>
                      </div>
                      <div className="text-center border-x border-slate-800 px-8">
                          <p className="text-2xl font-black">5.0</p>
                          <p className="text-[9px] text-slate-400 uppercase font-bold">Rating</p>
                      </div>
                      <div className="text-center">
                          <p className="text-2xl font-black text-emerald-400">99%</p>
                          <p className="text-[9px] text-slate-400 uppercase font-bold">Safety</p>
                      </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* VIEW: INQUIRIES */}
        {activeTab === "inquiries" && (
            <div className="max-w-5xl mx-auto space-y-8">
               <h2 className="text-3xl font-black text-slate-900">Communication Hub</h2>
               <div className="grid gap-5">
                 {messages.map((msg) => (
                   <div 
                     key={msg._id} 
                     onClick={() => { setSelectedMessage(msg); setShowModal(true); }}
                     className={`p-8 rounded-[30px] border bg-white transition-all cursor-pointer flex justify-between items-center ${
                       msg.status === 'unread' ? 'border-emerald-400' : 'border-slate-100 opacity-60'
                     }`}
                   >
                     <div className="flex items-center gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-lg">
                         {msg.userName[0]}
                       </div>
                       <div>
                         <h4 className="font-black text-slate-800 text-lg">{msg.userName}</h4>
                         <p className="text-sm text-slate-400 font-medium">{msg.userEmail}</p>
                       </div>
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{msg.status}</span>
                   </div>
                 ))}
               </div>
            </div>
        )}

      </main>

      {/* DETAIL MODAL OVERLAY */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
           <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl">
              <div className="p-10 space-y-8">
                <div className="flex justify-between">
                    <h2 className="text-3xl font-black text-slate-900">{selectedMessage.userName}</h2>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 text-2xl">×</button>
                </div>
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Message</p>
                    <p className="text-slate-700 italic bg-slate-50 p-6 rounded-3xl">"{selectedMessage.message}"</p>
                </div>
                <div className="flex gap-4">
                   <button className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black">Accept Booking</button>
                   <button className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black">Decline</button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GuideDashboard;