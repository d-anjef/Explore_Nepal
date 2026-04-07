import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../redux/user/userSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { FaEnvelope, FaLock } from "react-icons/fa";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
    form: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [id]: "",
      form: "",
    }));
  };

  const validateForm = () => {
    const errors = { email: "", password: "", form: "" };

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

    setFieldErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      dispatch(loginStart());
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        const message = data?.message || "Invalid email or password";
        dispatch(loginFailure(message));
        toast.error(message);
        setFieldErrors((prev) => ({ ...prev, form: message }));
        return;
      }

      dispatch(loginSuccess(data?.user));
      toast.success("Login successful!");
      
      // Navigate based on user role
      if (data?.user?.user_role === 1) {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      const message = err?.message || "Something went wrong while logging in";
      dispatch(loginFailure(message));
      toast.error(message);
      setFieldErrors((prev) => ({ ...prev, form: message }));
      console.log(err);
    }
  };

  return (
    <div
      className="flex justify-center items-center relative"
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
          <h1 className="text-4xl text-center font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-center text-gray-600 mb-8">Sign in to continue your journey</p>
          
          <div className="flex flex-col gap-6">
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
                  placeholder="Enter your password"
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

            <button
              disabled={loading}
              className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed font-semibold transition-all shadow-md hover:shadow-lg mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {(fieldErrors.form || error) && (
              <p className="text-sm text-red-600 text-center">
                {fieldErrors.form || error}
              </p>
            )}

            <div className="text-center mt-4">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
