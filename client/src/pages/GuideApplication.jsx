import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaLanguage, FaFileAlt } from "react-icons/fa";

const GuideApplication = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    experience: "",
    languages: "",
    coverLetter: "",
  });

  // Check if user already has a pending application
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (currentUser?.email) {
        try {
          const res = await fetch(
            `/api/guide-application/check-guide-status/${currentUser.email}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );
          const data = await res.json();

          if (data.success && data.hasApplication) {
            toast.error("Your guide application is already pending!");
            navigate("/home");
            return;
          }
        } catch (error) {
          console.log(error);
        }
      }
    };

    checkExistingApplication();
  }, [currentUser, navigate]);

  // Auto-fill name, email, and phone from user profile
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
    const { id, value } = e.target;
    
    // Warn if user tries to change email to something different
    if (id === "email" && currentUser?.email && value !== currentUser.email) {
      toast.error("Email must match your account email!");
      return;
    }
    
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.dateOfBirth ||
      !formData.experience ||
      !formData.languages ||
      !formData.coverLetter
    ) {
      toast.error("Please fill all required fields!");
      return;
    }

    // Check if email matches the logged-in user's email
    if (currentUser?.email && formData.email !== currentUser.email) {
      toast.error("Email must match your account email!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/guide-application/submit-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          address: "",
          dateOfBirth: "",
          experience: "",
          languages: "",
          coverLetter: "",
        });
        navigate("/home");
      } else {
        toast.error(data.message || "Failed to submit application");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Become a Tour Guide
            </h1>
            <p className="text-gray-600">
              Join our team and share your passion for travel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="border-b pb-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="flex items-center gap-2 text-gray-700 font-semibold mb-2"
                  >
                    <FaUser className="text-blue-600" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder=""
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-gray-700 font-semibold mb-2"
                  >
                    <FaEnvelope className="text-blue-600" />
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed outline-none"
                    placeholder=""
                    required
                    readOnly
                    title="Email is auto-filled from your account"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email is auto-filled from your account
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-gray-700 font-semibold mb-2"
                  >
                    <FaPhone className="text-blue-600" />
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="+1 234 567 8900"
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="flex items-center gap-2 text-gray-700 font-semibold mb-2"
                  >
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="flex items-center gap-2 text-gray-700 font-semibold mb-2"
                  >
                    <FaMapMarkerAlt className="text-blue-600" />
                    Address *
                  </label>
                  <textarea
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    rows="2"
                    placeholder="Your full address"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="border-b pb-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Professional Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Experience */}
                <div>
                  <label
                    htmlFor="experience"
                    className="flex items-center gap-2 text-gray-700 font-semibold mb-2"
                  >
                    <FaBriefcase className="text-blue-600" />
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    id="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="5"
                    min="0"
                    required
                  />
                </div>

                {/* Languages */}
                <div>
                  <label
                    htmlFor="languages"
                    className="flex items-center gap-2 text-gray-700 font-semibold mb-2"
                  >
                    <FaLanguage className="text-blue-600" />
                    Languages Spoken *
                  </label>
                  <input
                    type="text"
                    id="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="English, Spanish, French"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <label
                htmlFor="coverLetter"
                className="flex items-center gap-2 text-gray-700 font-semibold mb-2"
              >
                <FaFileAlt className="text-blue-600" />
                Cover Letter / Why do you want to be a tour guide? *
              </label>
              <textarea
                id="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows="6"
                placeholder="Tell us about yourself and why you'd be a great tour guide..."
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GuideApplication;
