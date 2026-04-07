import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  updatePassStart,
  updatePassSuccess,
  updatePassFailure,
} from "../../redux/user/userSlice";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{7,15}$/;

const UpdateProfile = () => {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [updateProfileDetailsPanel, setUpdateProfileDetailsPanel] =
    useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    address: "",
    phone: "",
    avatar: "",
  });
  const [updatePassword, setUpdatePassword] = useState({
    oldpassword: "",
    newpassword: "",
  });
  const [profileErrors, setProfileErrors] = useState({
    username: "",
    email: "",
    address: "",
    phone: "",
    form: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    oldpassword: "",
    newpassword: "",
    form: "",
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setProfileErrors((prev) => ({ ...prev, [id]: "", form: "" }));
  };

  const handlePass = (e) => {
    const { id, value } = e.target;
    setUpdatePassword((prev) => ({
      ...prev,
      [id]: value,
    }));
    setPasswordErrors((prev) => ({ ...prev, [id]: "", form: "" }));
  };

  const validateProfile = () => {
    const errors = {
      username: "",
      email: "",
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

    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.trim())) {
      errors.phone = "Enter a valid phone number";
    }

    setProfileErrors(errors);
    return (
      !errors.username && !errors.email && !errors.address && !errors.phone
    );
  };

  const validatePassword = () => {
    const errors = {
      oldpassword: "",
      newpassword: "",
      form: "",
    };

    if (!updatePassword.oldpassword.trim()) {
      errors.oldpassword = "Old password is required";
    }

    if (!updatePassword.newpassword.trim()) {
      errors.newpassword = "New password is required";
    } else if (updatePassword.newpassword.length < 6) {
      errors.newpassword = "New password must be at least 6 characters";
    }

    if (
      updatePassword.oldpassword &&
      updatePassword.newpassword &&
      updatePassword.oldpassword === updatePassword.newpassword
    ) {
      errors.newpassword = "New password must be different from old password";
    }

    setPasswordErrors(errors);
    return !errors.oldpassword && !errors.newpassword;
  };

  const updateUserDetails = async (e) => {
    e.preventDefault();

    if (
      currentUser.username === formData.username &&
      currentUser.email === formData.email &&
      currentUser.address === formData.address &&
      currentUser.phone === formData.phone
    ) {
      setProfileErrors((prev) => ({
        ...prev,
        form: "Change at least one field to update details",
      }));
      return;
    }

    if (!validateProfile()) return;

    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false && res.status !== 201 && res.status !== 200) {
        dispatch(updateUserSuccess());
        dispatch(updateUserFailure(data?.messsage));
        toast.error("Session Ended! Please login again");
        navigate("/login");
        return;
      }
      if (data.success && res.status === 201) {
        dispatch(updateUserSuccess(data?.user));
        return;
      }
      setProfileErrors((prev) => ({
        ...prev,
        form: data?.message || "Failed to update profile",
      }));
    } catch (error) {
      console.log(error);
      setProfileErrors((prev) => ({
        ...prev,
        form: "Something went wrong while updating profile",
      }));
    }
  };

  const updateUserPassword = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    try {
      dispatch(updatePassStart());
      const res = await fetch(`/api/user/update-password/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePassword),
      });
      const data = await res.json();
      if (data.success === false && res.status !== 201 && res.status !== 200) {
        dispatch(updateUserSuccess());
        dispatch(updatePassFailure(data?.message));
        toast.error("Session Ended! Please login again");
        navigate("/login");
        return;
      }
      dispatch(updatePassSuccess());
      setUpdatePassword({
        oldpassword: "",
        newpassword: "",
      });
    } catch (error) {
      console.log(error);
      setPasswordErrors((prev) => ({
        ...prev,
        form: "Something went wrong while updating password",
      }));
    }
  };

  return (
    <div
      className={`updateProfile w-full p-3 m-1 transition-all duration-300 flex justify-center`}
    >
      {updateProfileDetailsPanel === true ? (
        <div className="flex flex-col border self-center border-black rounded-lg p-2 w-72 h-fit gap-2 sm:w-[320px]">
          <h1 className="text-2xl text-center font-semibold">Update Profile</h1>
          <div className="flex flex-col">
            <label htmlFor="username" className="font-semibold">
              Username:
            </label>
            <input
              type="text"
              id="username"
              className="p-3 text-lg rounded border border-black"
              value={formData.username}
              onChange={handleChange}
              aria-invalid={!!profileErrors.username}
            />
            {profileErrors.username && (
              <p className="mt-1 text-sm text-red-600">
                {profileErrors.username}
              </p>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="email" className="font-semibold">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="p-3 text-lg rounded border border-black"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={!!profileErrors.email}
            />
            {profileErrors.email && (
              <p className="mt-1 text-sm text-red-600">
                {profileErrors.email}
              </p>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="address" className="font-semibold">
              Address:
            </label>
            <textarea
              maxLength={200}
              type="text"
              id="address"
              rows="5"
              className="p-3 text-lg rounded border border-black resize-none"
              value={formData.address}
              onChange={handleChange}
              aria-invalid={!!profileErrors.address}
            />
            {profileErrors.address && (
              <p className="mt-1 text-sm text-red-600">
                {profileErrors.address}
              </p>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="phone" className="font-semibold">
              Phone:
            </label>
            <input
              type="text"
              id="phone"
              className="p-3 text-lg rounded border border-black"
              value={formData.phone}
              onChange={handleChange}
              aria-invalid={!!profileErrors.phone}
            />
            {profileErrors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {profileErrors.phone}
              </p>
            )}
          </div>
          {profileErrors.form && (
            <p className="text-sm text-red-600">{profileErrors.form}</p>
          )}
          <button
            disabled={loading}
            onClick={updateUserDetails}
            className="p-2 text-white bg-slate-700 rounded hover:opacity-95 disabled:opacity-70"
          >
            {loading ? "Loading..." : "Update"}
          </button>
          <button
            disabled={loading}
            type="button"
            onClick={() => setUpdateProfileDetailsPanel(false)}
            className="p-2 text-white bg-red-700 rounded hover:opacity-95 disabled:opacity-70"
          >
            {loading ? "Loading..." : "Change Password"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col border border-black rounded-lg p-2 w-72 h-fit gap-2 sm:w-[320px]">
          <h1 className="text-2xl text-center font-semibold">
            Change Password
          </h1>
          <div className="flex flex-col">
            <label htmlFor="oldpassword" className="font-semibold">
              Enter old password:
            </label>
            <input
              type="password"
              id="oldpassword"
              className="p-1 rounded border border-black"
              value={updatePassword.oldpassword}
              onChange={handlePass}
              aria-invalid={!!passwordErrors.oldpassword}
            />
            {passwordErrors.oldpassword && (
              <p className="mt-1 text-sm text-red-600">
                {passwordErrors.oldpassword}
              </p>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="newpassword" className="font-semibold">
              Enter new password:
            </label>
            <input
              type="password"
              id="newpassword"
              className="p-1 rounded border border-black"
              value={updatePassword.newpassword}
              onChange={handlePass}
              aria-invalid={!!passwordErrors.newpassword}
            />
            {passwordErrors.newpassword && (
              <p className="mt-1 text-sm text-red-600">
                {passwordErrors.newpassword}
              </p>
            )}
          </div>
          {passwordErrors.form && (
            <p className="text-sm text-red-600">{passwordErrors.form}</p>
          )}
          <button
            disabled={loading}
            onClick={updateUserPassword}
            className="p-2 text-white bg-slate-700 rounded hover:opacity-95 disabled:opacity-70"
          >
            {loading ? "Loading..." : "Update Password"}
          </button>
          <button
            disabled={loading}
            onClick={() => {
              setUpdateProfileDetailsPanel(true);
              setUpdatePassword({
                oldpassword: "",
                newpassword: "",
              });
            }}
            type="button"
            className="p-2 text-white bg-red-700 rounded hover:opacity-95 w-24 disabled:opacity-70"
          >
            {loading ? "Loading..." : "Back"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UpdateProfile;
