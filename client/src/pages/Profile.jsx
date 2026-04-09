import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { 
  getDownloadURL, 
  getStorage, 
  ref, 
  uploadBytesResumable 
} from 'firebase/storage';
import { app } from '../firebase'; 
import { 
  updateUserStart, 
  updateUserSuccess, 
  updateUserFailure 
} from '../redux/user/userSlice';
import toast from "react-hot-toast";
import { 
  FaHistory, 
  FaSuitcase, 
  FaUserEdit, 
  FaUserTie, 
  FaCamera,
  FaCheckCircle,
  FaClock,
  FaPhoneAlt,
  FaEnvelope,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaLanguage,
  FaAward,
  FaShieldAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Sub-components
import MyBookings from "./user/MyBookings";
import UpdateProfile from "./user/UpdateProfile";
import MyHistory from "./user/MyHistory";

const Profile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  
  const [activePanelId, setActivePanelId] = useState(1);
  const [guideStatus, setGuideStatus] = useState('none'); 
  const [confirmedGuides, setConfirmedGuides] = useState([]);

  useEffect(() => {
    if (file) handleFileUpload(file);
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => toast.error("Upload failed. Max size 2MB."),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          updateUserProfile({ avatar: downloadURL });
        });
      }
    );
  };

  const updateUserProfile = async (formData) => {
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      toast.success("Profile updated!");
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  useEffect(() => {
    if (currentUser) {
      checkGuideStatus();
      fetchConfirmedGuides();
    }
  }, [currentUser]);

  // ✅ FIX: Added check to prevent "Unexpected Token W" error
  const checkGuideStatus = async () => {
    try {
      const res = await fetch(`/api/guide-application/get-status/${currentUser.email}`);
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.success) setGuideStatus(data.status);
      } else {
        const text = await res.text();
        console.warn("Guide Status API returned non-JSON:", text);
      }
    } catch (error) { console.error(error); }
  };

  // ✅ FIX: Added safety check for non-JSON responses
  const fetchConfirmedGuides = async () => {
    try {
      const res = await fetch(`/api/guide-message/get-user-messages/${currentUser.email}`);
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.success) {
          const accepted = data.messages.filter(msg => msg.status === 'approved');
          setConfirmedGuides(accepted);
        }
      }
    } catch (error) { console.log(error); }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="bg-white border-b border-slate-200 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <input type="file" ref={fileRef} hidden accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative cursor-pointer" onClick={() => fileRef.current.click()}>
              <img src={currentUser.avatar} className="w-full h-full object-cover" alt="Profile" />
              {filePerc > 0 && filePerc < 100 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 font-black text-teal-600 text-xs">{filePerc}%</div>
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 mb-1">{currentUser.username}</h1>
            <p className="text-slate-500 font-medium mb-4">{currentUser.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                <FaCheckCircle className="text-teal-500" /> Verified Traveler
              </span>
            </div>
          </div>
        </div>

        {confirmedGuides.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto mt-12"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Your Confirmed Travel Partner</h2>
              <div className="h-px flex-1 bg-slate-100 ml-6"></div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {confirmedGuides.map((guide) => (
                <div key={guide._id} className="bg-white border-2 border-emerald-500/10 rounded-[3rem] p-10 shadow-2xl shadow-emerald-900/5 relative overflow-hidden">
                  
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white px-8 py-3 rounded-bl-3xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
                    <FaShieldAlt className="animate-pulse" /> Ready to Travel
                  </div>

                  <div className="flex items-center gap-8 mb-10">
                    <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 shadow-inner border border-emerald-100">
                      <FaUserTie size={40} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{guide.guideName}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Verified Professional</span>
                        <div className="flex items-center text-amber-500 gap-1 text-sm font-black">
                            <FaAward /> Expert
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ✅ FIX: Changed <p> to <div> to avoid DOM Nesting Warning */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12 border-t border-slate-50 pt-10">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Email</p>
                      <div className="text-sm text-slate-800 font-bold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-500">
                          <FaEnvelope size={14} />
                        </div>
                        {guide.guideEmail}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct Line</p>
                      <div className="text-sm text-slate-800 font-bold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-500">
                          <FaPhoneAlt size={14} />
                        </div>
                        {guide.userPhone}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Planned Duration</p>
                      <div className="text-sm text-slate-800 font-bold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-500">
                          <FaHourglassHalf size={14} />
                        </div>
                        {guide.tourDays} Days Adventure
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Protocol</p>
                      <div className="text-sm text-slate-800 font-bold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-500">
                          <FaMapMarkerAlt size={14} />
                        </div>
                        Hotel/Airport Pickup
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Language Proficiency</p>
                      <div className="text-sm text-slate-800 font-bold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-500">
                          <FaLanguage size={18} />
                        </div>
                        English, Nepali, Hindi
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking Status</p>
                      <div className="text-xs text-emerald-600 font-black uppercase flex items-center gap-2 py-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                        Active Engagement
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 grid lg:grid-cols-4 gap-10">
        <aside className="lg:col-span-1 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">Account Dashboard</p>
          {[
            { id: 1, name: "Upcoming Trips", icon: FaSuitcase },
            { id: 2, name: "Travel History", icon: FaHistory },
            { id: 3, name: "Account Settings", icon: FaUserEdit }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePanelId(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-sm ${
                activePanelId === tab.id 
                ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 translate-x-1" 
                : "text-slate-500 hover:bg-white hover:text-slate-900"
              }`}
            >
              <tab.icon className={activePanelId === tab.id ? "text-emerald-400" : "text-slate-400"} />
              {tab.name}
            </button>
          ))}
        </aside>

        <main className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanelId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activePanelId === 1 && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Bookings</h2>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-lg uppercase">Real-time status</span>
                  </div>
                  <MyBookings />
                </section>
              )}

              {activePanelId === 2 && (
                <section className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Adventure History</h2>
                  <MyHistory />
                </section>
              )}

              {activePanelId === 3 && (
                <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                  <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Security & Identity</h2>
                  <p className="text-slate-500 text-sm font-medium mb-10">Manage your profile credentials and security.</p>
                  <UpdateProfile />
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Profile;