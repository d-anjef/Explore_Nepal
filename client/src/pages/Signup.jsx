import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
    form: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // Only allow numbers for phone field
    if (id === "phone") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [id]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
    
    setFieldErrors((prev) => ({
      ...prev,
      [id]: "",
      form: "",
    }));
  };

  const validateForm = () => {
    const errors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      address: "",
      phone: "",
      form: "",
    };

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Enter a valid email address";
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.trim())) {
      errors.phone = "Phone number must be exactly 10 digits";
    }

    setFieldErrors(errors);
    return (
      !errors.username &&
      !errors.email &&
      !errors.password &&
      !errors.confirmPassword &&
      !errors.address &&
      !errors.phone
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all required fields are filled
    if (!formData.username || !formData.email || !formData.password || 
        !formData.confirmPassword || !formData.address || !formData.phone) {
      toast.error("Please fill out all the form fields");
      return;
    }

    if (!validateForm()) return;

    try {
      const res = await axios.post(`/api/auth/signup`, formData);
      if (res?.data?.success) {
        toast.success("Account created successfully! Please login.");
        navigate("/login");
      } else {
        const errorMsg = res?.data?.message || "Signup failed. Please try again.";
        toast.error(errorMsg);
        setFieldErrors((prev) => ({
          ...prev,
          form: errorMsg,
        }));
      }
    } catch (error) {
      console.log(error);
      const errorMsg = "Something went wrong while signing up";
      toast.error(errorMsg);
      setFieldErrors((prev) => ({
        ...prev,
        form: errorMsg,
      }));
    }
  };

  return (
    <div
      className="flex justify-center items-center relative py-8"
      style={{
        width: "100%",
        minHeight: "calc(100vh - 80px)",
      }}
    >
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/src/assets/images/bg_jmg1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-white/30"></div>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col border border-gray-300 rounded-xl shadow-2xl p-8 w-80 sm:w-[450px] bg-white/95 backdrop-blur-sm">
          <h1 className="text-4xl text-center font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-center text-gray-600 mb-6">Join us and start your adventure</p>
          
          <div className="flex flex-col gap-5">
            <div className="flex flex-col">
              <label htmlFor="username" className="font-semibold text-gray-700 mb-2 text-sm">
                Username
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  placeholder="Choose a username"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                  aria-invalid={!!fieldErrors.username}
                />
              </div>
              {fieldErrors.username && (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.username}</p>
              )}
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="email" className="font-semibold text-gray-700 mb-2 text-sm">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  aria-invalid={!!fieldErrors.email}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="password" className="font-semibold text-gray-700 mb-2 text-sm">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  placeholder="Create a password"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  aria-invalid={!!fieldErrors.password}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="confirmPassword" className="font-semibold text-gray-700 mb-2 text-sm">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  aria-invalid={!!fieldErrors.confirmPassword}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="address" className="font-semibold text-gray-700 mb-2 text-sm">
                Address
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400" />
                <textarea
                  maxLength={200}
                  id="address"
                  placeholder="Enter your address"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  aria-invalid={!!fieldErrors.address}
                />
              </div>
              {fieldErrors.address && (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.address}</p>
              )}
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="phone" className="font-semibold text-gray-700 mb-2 text-sm">
                Phone Number
              </label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  placeholder="Enter phone number"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  inputMode="numeric"
                  aria-invalid={!!fieldErrors.phone}
                />
              </div>
              {fieldErrors.phone && (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.phone}</p>
              )}
            </div>

            <button 
              className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-md hover:shadow-lg mt-2"
            >
              Create Account
            </button>

            {fieldErrors.form && (
              <p className="text-sm text-red-600 text-center">{fieldErrors.form}</p>
            )}

            <div className="text-center mt-2">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Signup;
