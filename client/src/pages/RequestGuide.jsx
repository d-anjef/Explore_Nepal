import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FaSearch, FaMapMarkerAlt, FaLanguage, FaBriefcase, 
  FaStar, FaCheckCircle, FaTools, FaRoute, FaAward 
} from "react-icons/fa";

const RequestGuide = () => {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [tourDays, setTourDays] = useState("");
  const [tourDate, setTourDate] = useState("");
  const [sending, setSending] = useState(false);
  const [guideBookings, setGuideBookings] = useState({});

  useEffect(() => {
    if (location.state?.duration) setTourDays(location.state.duration.toString());
    if (location.state?.date) setTourDate(location.state.date);
  }, [location.state]);

  const isFromBooking = location.state?.duration && location.state?.date;

  const fetchApprovedGuides = async () => {
    try {
      setLoading(true);
      await fetchGuideBookings();
      const res = await fetch(`/api/guide-application/get-approved-guides?searchTerm=${searchTerm}`);
      const data = await res.json();

      if (data.success) {
        let acceptedEmails = [];
        if (currentUser?.email) {
          const msgRes = await fetch(`/api/guide-message/get-user-messages/${currentUser.email}`, {
            credentials: "include",
          });
          const msgData = await msgRes.json();
          if (msgData.success) {
            acceptedEmails = msgData.messages
              .filter((msg) => msg.status === "approved")
              .map((msg) => msg.guideEmail);
          }
        }
        const filtered = (data.guides || []).filter(
          (g) => g && g.email !== currentUser?.email && !acceptedEmails.includes(g.email)
        );
        setGuides(filtered);
      }
    } catch (error) {
      toast.error("Failed to fetch guides");
    } finally {
      setLoading(false);
    }
  };

  const fetchGuideBookings = async () => {
    try {
      const res = await fetch('/api/guide-message/get-all-messages', { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        const bookingsMap = {};
        const today = new Date().setHours(0,0,0,0);
        data.messages.forEach((msg) => {
          if (msg.status === 'approved' && msg.tourDate) {
            const start = new Date(msg.tourDate).setHours(0,0,0,0);
            const end = new Date(start).setDate(new Date(start).getDate() + (parseInt(msg.tourDays) || 1));
            if (today >= start && today < end) {
              bookingsMap[msg.guideEmail] = (bookingsMap[msg.guideEmail] || 0) + 1;
            }
          }
        });
        setGuideBookings(bookingsMap);
      }
    } catch (error) { console.log(error); }
  };

  useEffect(() => { fetchApprovedGuides(); }, [searchTerm, currentUser]);

  const handleContactGuide = (guide) => {
    if (!currentUser) {
      toast.error("Please login to contact guides");
      navigate("/login");
      return;
    }
    setSelectedGuide(guide);
    setShowModal(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !tourDays || !tourDate) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setSending(true);
      const res = await fetch("/api/guide-message/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          guideId: selectedGuide._id,
          guideName: selectedGuide.fullName,
          guideEmail: selectedGuide.email,
          userName: currentUser.username,
          userEmail: currentUser.email,
          userPhone: currentUser.phone || "N/A",
          message,
          tourDays: parseInt(tourDays),
          tourDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Request sent successfully!");
        setShowModal(false);
        setTimeout(() => navigate("/home"), 1500);
      }
    } catch (error) {
      toast.error("Error sending message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Elite Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">
            Elite <span className="text-blue-600">Portfolios</span>
          </h1>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium">
            Connect with Nepal's most decorated guides. Verified gear, specialized routes, and proven success.
          </p>
        </div>

        {/* Professional Search */}
        <div className="mb-16 max-w-3xl mx-auto">
          <div className="relative group">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors text-xl" />
            <input
              type="text"
              placeholder="Search by expertise, peak, or specialized gear..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 focus:border-blue-500 outline-none text-lg transition-all"
            />
          </div>
        </div>

        {/* Guides Portfolio Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {guides.map((guide) => {
              const bookingCount = guideBookings[guide.email] || 0;
              const isBooked = bookingCount > 0;
              
              return (
                <div key={guide._id} className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden flex flex-col group">
                  
                  {/* Portfolio Header: Identity */}
                  <div className="bg-slate-900 p-10 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <h3 className="text-3xl font-black tracking-tight group-hover:text-blue-400 transition-colors">{guide.fullName}</h3>
                            <div className="flex items-center gap-2 mt-2 text-slate-400 font-bold text-sm uppercase tracking-widest">
                                <FaAward className="text-yellow-500" /> Professional Guide
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl text-center">
                            <p className="text-[10px] font-black uppercase text-slate-400">Rating</p>
                            <div className="flex items-center gap-1 text-yellow-400 font-black">
                                <FaStar /> 4.9
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Portfolio Body: Performance Metrics */}
                  <div className="p-10 space-y-8 flex-1">
                    
                    {/* The Trust Bar */}
                    <div className="flex justify-between bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                        <div className="text-center">
                            <p className="text-lg font-black text-slate-900">{guide.experience}+</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Exp Years</p>
                        </div>
                        <div className="text-center border-x border-slate-200 px-6">
                            <p className="text-lg font-black text-slate-900">120+</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Tours Led</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black text-blue-600">99%</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Safety</p>
                        </div>
                    </div>

                    {/* Signature Routes */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest">
                            <FaRoute className="text-blue-500" /> Mastered Routes
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["Everest Base", "Annapurna", "Lantang"].map((route, i) => (
                                <span key={i} className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-full">
                                    {route}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Gear & Tools */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest">
                            <FaTools className="text-blue-500" /> Field Equipment
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["GPS Tracker", "First Aid", "Oxy-Meter"].map((gear, i) => (
                                <span key={i} className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1">
                                    <FaCheckCircle className="text-[8px]" /> {gear}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Location & Languages Footer */}
                    <div className="pt-6 border-t border-slate-50 flex justify-between items-center text-sm font-bold text-slate-500">
                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-red-500" /> {guide.address?.split(',')[0]}
                        </div>
                        <div className="flex items-center gap-2">
                            <FaLanguage className="text-blue-500" /> {guide.languages?.split(',')[0]}
                        </div>
                    </div>

                    {/* Booking Action */}
                    <button
                      onClick={() => handleContactGuide(guide)}
                      disabled={isBooked}
                      className={`w-full py-5 rounded-[2rem] font-black text-sm transition-all shadow-xl active:scale-95 ${
                        isBooked 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300'
                      }`}
                    >
                      {isBooked ? "Currently Serving Clients" : "Book Elite Guide"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Enhanced Contact Modal */}
        {showModal && selectedGuide && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
            <div className="bg-white rounded-[3.5rem] max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="p-12">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Inquiry Terminal</h3>
                    <p className="text-blue-600 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Consulting: {selectedGuide.fullName}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="bg-slate-100 text-slate-400 hover:text-slate-900 w-12 h-12 rounded-full flex items-center justify-center transition-all text-2xl">×</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Trip Duration (Days)</label>
                        <input
                          type="number"
                          value={tourDays}
                          onChange={(e) => setTourDays(e.target.value)}
                          readOnly={isFromBooking}
                          className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-[1.5rem] font-black outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Expedition Start Date</label>
                        <input
                          type="date"
                          value={tourDate}
                          onChange={(e) => setTourDate(e.target.value)}
                          readOnly={isFromBooking}
                          className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-[1.5rem] font-black outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-3 mb-10">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Expedition Brief / Special Requests</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your goals, experience level, and preferred routes..."
                      className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-[1.5rem] font-medium outline-none transition-all resize-none"
                      rows="5"
                    />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={sending}
                  className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg hover:bg-slate-800 disabled:opacity-50 transition-all shadow-2xl shadow-slate-300 flex items-center justify-center gap-3"
                >
                  {sending ? "Processing..." : "Deploy Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestGuide;