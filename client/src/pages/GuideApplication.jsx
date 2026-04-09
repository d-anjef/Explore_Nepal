import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, 
  FaBriefcase, FaLanguage, FaFileAlt, FaSearch, 
  FaChevronRight, FaShieldAlt, FaChartLine, FaGlobeAmericas, FaQuoteLeft, FaLink 
} from "react-icons/fa";

const GuideApplication = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    experience: "",
    languages: "",
    coverLetter: "",
    resume: "", // Added Resume field
  });

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: currentUser.username || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.resume) {
      return toast.error("Please provide a link to your CV/Resume");
    }

    try {
      setLoading(true);
      const res = await fetch("/api/guide-application/submit-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Application submitted successfully!");
        setShowForm(false);
        navigate("/home");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans">
      {/* 1. HERO SECTION */}
      <div className="relative h-[50vh] bg-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070')] bg-cover bg-center" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
            Guides of Nepal
          </h1>
          <p className="text-slate-300 max-w-xl mx-auto text-base font-medium">
            Join the elite circle of Himalayan experts or find the perfect companion for your next expedition.
          </p>
        </div>
      </div>

      {/* 2. MAIN SELECTION CARDS */}
      <div className="max-w-6xl mx-auto px-6 -translate-y-24 mb-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="group bg-white rounded-[2.5rem] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-[0_20px_60px_rgba(79,70,229,0.15)] duration-500">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform duration-500">
              <FaSearch size={32} />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Find an Expert</h2>
            <p className="text-slate-500 mb-10 text-base leading-relaxed">
              Elevate your journey with a verified local guide. Safety, storytelling, and secret trails await.
            </p>
            <button 
              onClick={() => navigate("/request-guide")}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-lg"
            >
              Browse All Guides <FaChevronRight size={10} />
            </button>
          </div>

          <div className="group bg-indigo-600 rounded-[2.5rem] p-12 shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex flex-col items-center text-center transition-all hover:-translate-y-2 duration-500">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-white mb-8 group-hover:rotate-12 transition-transform duration-500">
              <FaBriefcase size={32} />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-4">Join the Network</h2>
            <p className="text-indigo-100 mb-10 text-base leading-relaxed">
              Are you a mountain expert? Turn your local knowledge into a global professional career today.
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="w-full py-5 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-slate-900 hover:text-white transition-all shadow-lg"
            >
              Start Your Application <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. WHY CHOOSE US */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">The Standard of Excellence</h2>
          <div className="h-1.5 w-24 bg-indigo-600 mx-auto rounded-full" />
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="text-indigo-600 flex justify-center mb-6"><FaShieldAlt size={45} /></div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">Verified Expertise</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Every guide undergoes a rigorous background check to ensure safety.</p>
          </div>
          <div className="text-center">
            <div className="text-indigo-600 flex justify-center mb-6"><FaGlobeAmericas size={45} /></div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">Cultural Immersion</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Our guides bring you into the heart of local traditions and hidden spots.</p>
          </div>
          <div className="text-center">
            <div className="text-indigo-600 flex justify-center mb-6"><FaChartLine size={45} /></div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">Professional Growth</h3>
            <p className="text-slate-500 text-sm leading-relaxed">We provide our partners with training and a stream of global clients.</p>
          </div>
        </div>
      </div>

      {/* 4. TESTIMONIAL */}
      <div className="bg-slate-50 py-24 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto relative text-center">
          <FaQuoteLeft className="absolute -top-10 -left-10 text-slate-200" size={120} />
          <div className="relative z-10">
            <p className="text-2xl md:text-3xl font-medium text-slate-800 italic leading-relaxed mb-8">
              "Being a guide transformed my passion for trekking into a stable business."
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-full border-4 border-white shadow-md" />
              <div className="text-left">
                <p className="font-black uppercase tracking-widest text-xs">Pasang Sherpa</p>
                <p className="text-indigo-600 font-bold text-[10px] uppercase">Senior Trekking Lead</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Guide Registration</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Himalayan Professional Network</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-indigo-600 transition-colors">Full Name</label>
                  <input id="fullName" value={formData.fullName} onChange={handleChange} className="w-full py-4 px-0 border-b-2 border-slate-100 focus:border-indigo-600 bg-transparent outline-none transition-all font-semibold" required />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-indigo-600 transition-colors">Phone Number</label>
                  <input id="phone" value={formData.phone} onChange={handleChange} className="w-full py-4 px-0 border-b-2 border-slate-100 focus:border-indigo-600 bg-transparent outline-none transition-all font-semibold" required />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-indigo-600 transition-colors">Languages</label>
                  <input id="languages" value={formData.languages} placeholder="e.g., Nepali, English" onChange={handleChange} className="w-full py-4 px-0 border-b-2 border-slate-100 focus:border-indigo-600 bg-transparent outline-none transition-all font-semibold" required />
                </div>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-indigo-600 transition-colors">Experience (Years)</label>
                  <input id="experience" type="number" value={formData.experience} onChange={handleChange} className="w-full py-4 px-0 border-b-2 border-slate-100 focus:border-indigo-600 bg-transparent outline-none transition-all font-semibold" required />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-indigo-600 transition-colors">Address</label>
                  <input id="address" value={formData.address} onChange={handleChange} className="w-full py-4 px-0 border-b-2 border-slate-100 focus:border-indigo-600 bg-transparent outline-none transition-all font-semibold" required />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-indigo-600 transition-colors">DOB</label>
                  <input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} className="w-full py-4 px-0 border-b-2 border-slate-100 focus:border-indigo-600 bg-transparent outline-none transition-all font-semibold" required />
                </div>
              </div>

              {/* CV / RESUME OPTION */}
              <div className="md:col-span-2 group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-2">
                  <FaLink /> CV / Resume Link (Google Drive or Dropbox)
                </label>
                <input 
                  id="resume" 
                  value={formData.resume} 
                  onChange={handleChange} 
                  placeholder="Paste your public resume link here..." 
                  className="w-full py-4 px-0 border-b-2 border-slate-100 focus:border-indigo-600 bg-transparent outline-none transition-all font-semibold text-slate-900" 
                  required 
                />
              </div>

              <div className="md:col-span-2 group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-indigo-600 transition-colors">Cover Letter</label>
                <textarea id="coverLetter" rows="4" value={formData.coverLetter} onChange={handleChange} className="w-full py-4 px-0 border-b-2 border-slate-100 focus:border-indigo-600 bg-transparent outline-none transition-all font-semibold resize-none" placeholder="Tell us about your mountaineering background..." required />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="md:col-span-2 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? "Registering..." : "Submit My Application"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideApplication;