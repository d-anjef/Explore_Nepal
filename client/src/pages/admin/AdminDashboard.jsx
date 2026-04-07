import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  logOutStart,
  logOutSuccess,
  logOutFailure,
  deleteUserAccountStart,
  deleteUserAccountSuccess,
  deleteUserAccountFailure,
} from "../../redux/user/userSlice";
import AllBookings from "./AllBookings";
import AdminUpdateProfile from "./AdminUpdateProfile";
import AddPackages from "./AddPackages";
import "./styles/DashboardStyle.css";
import AllPackages from "./AllPackages";
import AllUsers from "./AllUsers";
import Payments from "./Payments";
import RatingsReviews from "./RatingsReviews";
import History from "./History";
import GuideApplications from "./GuideApplications";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [profilePhoto, setProfilePhoto] = useState(undefined);
  const [photoPercentage, setPhotoPercentage] = useState(0);
  const [activePanelId, setActivePanelId] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    address: "",
    phone: "",
    avatar: "",
  });

  useEffect(() => {
    if (currentUser !== null) {
      setFormData({
        username: currentUser.username,
        email: currentUser.email,
        address: currentUser.address,
        phone: currentUser.phone,
        avatar: currentUser.avatar,
      });
    }
  }, [currentUser]);

  const handleProfilePhoto = async (photo) => {
    try {
      dispatch(updateUserStart());
      
      // Upload image to server
      const uploadFormData = new FormData();
      uploadFormData.append("image", photo);

      const uploadRes = await fetch("/api/upload/single", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        dispatch(updateUserFailure(uploadData.message));
        toast.error(uploadData.message || "Upload failed");
        return;
      }

      const downloadUrl = uploadData.imageUrl;

      // Update user profile with new image URL
      const res = await fetch(
        `/api/user/update-profile-photo/${currentUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ avatar: downloadUrl }),
        }
      );
      
      const data = await res.json();
      if (data?.success) {
        toast.success(data?.message);
        setFormData({ ...formData, avatar: downloadUrl });
        dispatch(updateUserSuccess(data?.user));
        setProfilePhoto(null);
        return;
      } else {
        dispatch(updateUserFailure(data?.message));
        toast.error(data?.message);
      }
    } catch (error) {
      console.log(error);
      dispatch(updateUserFailure(error.message));
      toast.error("Error uploading photo");
    }
  };

  const handleLogout = async () => {
    try {
      dispatch(logOutStart());
      const res = await fetch("/api/auth/logout");
      const data = await res.json();
      if (data?.success !== true) {
        dispatch(logOutFailure(data?.message));
        return;
      }
      dispatch(logOutSuccess());
      navigate("/login");
      toast.success(data?.message);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Delete Account?</p>
        <p className="text-sm text-gray-600">This action cannot be undone. Your account will be permanently deleted!</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              performDeleteAccount();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
    });
  };

  const performDeleteAccount = async () => {
    try {
      dispatch(deleteUserAccountStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.success === false) {
        dispatch(deleteUserAccountFailure(data?.message));
        toast.error("Something went wrong!");
        return;
      }
      dispatch(deleteUserAccountSuccess());
      toast.success(data?.message);
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      {currentUser ? (
        <>
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              {/* Profile Header */}
              <div className="bg-sky-500 p-6 text-center">
                <div className="relative inline-block">
                  <img
                    src={
                      (profilePhoto && URL.createObjectURL(profilePhoto)) ||
                      formData.avatar
                    }
                    alt="Profile photo"
                    className="w-28 h-28 rounded-full object-cover border-3 border-white shadow-md cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => fileRef.current.click()}
                    onMouseOver={() => {
                      document
                        .getElementById("photoLabel")
                        .classList.remove("hidden");
                    }}
                    onMouseOut={() => {
                      document
                        .getElementById("photoLabel")
                        .classList.add("hidden");
                    }}
                  />
                  <input
                    type="file"
                    name="photo"
                    id="photo"
                    hidden
                    ref={fileRef}
                    accept="image/*"
                    onChange={(e) => setProfilePhoto(e.target.files[0])}
                  />
                  <label
                    htmlFor="photo"
                    id="photoLabel"
                    className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs py-1 rounded-b-full cursor-pointer hidden"
                  >
                    Change Photo
                  </label>
                </div>
                <h2 className="text-2xl font-semibold text-white mt-3">
                  {currentUser.username}
                </h2>
                <p className="text-white text-opacity-80 text-sm mt-1">Administrator</p>
              </div>

              {/* Upload Button */}
              {profilePhoto && (
                <div className="px-6 py-3 bg-gray-50">
                  <button
                    onClick={() => handleProfilePhoto(profilePhoto)}
                    className="w-full bg-green-600 text-white py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
                  >
                    {loading ? `Uploading...(${photoPercentage}%)` : "Upload Photo"}
                  </button>
                </div>
              )}

              {/* Profile Details */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
                  Profile Details
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-gray-500 font-semibold w-24">Email:</span>
                    <span className="text-gray-800 flex-1 break-all">{currentUser.email}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 font-semibold w-24">Phone:</span>
                    <span className="text-gray-800 flex-1">{currentUser.phone}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 font-semibold w-24">Address:</span>
                    <span className="text-gray-800 flex-1">{currentUser.address}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setActivePanelId(8)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 bg-red-600 text-white py-2 rounded-md font-medium hover:bg-red-700 transition-colors"
                  >
                    Log Out
                  </button>
                </div>

                {/* Delete Account */}
                <div className="mt-4 text-center">
                  <button
                    onClick={handleDeleteAccount}
                    className="text-red-600 text-sm hover:text-red-700 hover:underline"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

        </>
      ) : (
        <div>
          <p className="text-red-700">Login First</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
