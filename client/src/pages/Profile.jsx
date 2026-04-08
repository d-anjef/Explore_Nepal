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
  FaSignOutAlt,
  FaCamera,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Sub-components
import MyBookings from "./user/MyBookings";
import UpdateProfile from "./user/UpdateProfile";
import MyHistory from "./user/MyHistory";

const Profile = () => {
  const { currentUser, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Refs & States for Image Upload
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  
  // UI States
  const [activePanelId, setActivePanelId] = useState(1);
  const [hasGuideApplication, setHasGuideApplication] = useState(false);

  // Trigger Upload when file is selected
  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
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
      (error) => {
        setFileUploadError(true);
        toast.error("Upload failed. Max size 2MB.");
      },
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
        toast.error(data.message);
        return;
      }
      dispatch(updateUserSuccess(data));
      toast.success("Profile updated successfully!");
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      toast.error("Could not update profile.");
    }
  };

  useEffect(() => {
    if (currentUser) {
      checkGuideStatus();
    }
  }, [currentUser]);

  const checkGuideStatus = async () => {
    try {
      const res = await fetch(`/api/guide-application/check-guide-status/${currentUser.email}`);
      const data = await res.json();
      if (data.success) setHasGuideApplication(data.hasApplication);
    } catch (error) {
      console.error(error);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-slate-100">
          <p className="text-slate-500 font-bold mb-4">Your session has ended.</p>
          <button onClick={() => navigate('/sign-in')} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      {/* Header / Identity Section */}
      <div className="bg-white border-b border-slate-200 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
          
          {/* Avatar Upload Container */}
          <div className="relative group">
            <input 
              type="file" 
              ref={fileRef} 
              hidden 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files[0])} 
            />
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative cursor-pointer" onClick={() => fileRef.current.click()}>
              <img 
                src={currentUser.avatar} 
                className={`w-full h-full object-cover transition-opacity ${filePerc > 0 && filePerc < 100 ? 'opacity-40' : 'opacity-100'}`} 
                alt="Profile" 
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FaCamera className="text-white text-2xl" />
              </div>
              {filePerc > 0 && filePerc < 100 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 font-black text-teal-600 text-xs">
                  {filePerc}%
                </div>
              )}
            </div>
            <button 
              onClick={() => fileRef.current.click()}
              className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-3 rounded-2xl shadow-lg hover:scale-110 transition-transform"
            >
              <FaUserEdit size={14} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 mb-1">{currentUser.username}</h1>
            <p className="text-slate-500 font-medium mb-4">{currentUser.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                <FaClock className="text-teal-500" /> Member since 2026
              </span>
              {hasGuideApplication && (
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Guide Account
                </span>
              )}
            </div>
          </div>

          {!hasGuideApplication && (
            <Link to="/guide-application" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3">
              <FaUserTie /> Become a Guide
            </Link>
          )}
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="max-w-6xl mx-auto px-6 mt-12 grid lg:grid-cols-4 gap-10">
        
        {/* Navigation Sidebar */}
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
              <tab.icon className={activePanelId === tab.id ? "text-teal-400" : "text-slate-400"} />
              {tab.name}
            </button>
          ))}
          
  
        </aside>

        {/* Content Display Area */}
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
                    <h2 className="text-2xl font-black text-slate-900">My Active Bookings</h2>
                    <span className="bg-teal-100 text-teal-700 text-xs font-black px-3 py-1 rounded-lg">LIVE UPDATES</span>
                  </div>
                  {/* Here MyBookings should handle the logic for displaying individual cards */}
                  <MyBookings />
                </section>
              )}

              {activePanelId === 2 && (
                <section className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 mb-8">Adventure History</h2>
                  <MyHistory />
                </section>
              )}

              {activePanelId === 3 && (
                <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Security & Identity</h2>
                  <p className="text-slate-500 text-sm font-medium mb-10">Manage your password and contact preferences.</p>
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