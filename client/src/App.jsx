import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Header from "./pages/components/Header";
import Profile from "./pages/Profile";
import About from "./pages/About";
import PrivateRoute from "./pages/Routes/PrivateRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./pages/Routes/AdminRoute";
import UpdatePackage from "./pages/admin/UpdatePackage";
import AllBookings from "./pages/admin/AllBookings";
import AllPackages from "./pages/admin/AllPackages";
import AddPackages from "./pages/admin/AddPackages";
import AllUsers from "./pages/admin/AllUsers";
import Payments from "./pages/admin/Payments";
import RatingsReviews from "./pages/admin/RatingsReviews";
import History from "./pages/admin/History";
import GuideApplications from "./pages/admin/GuideApplications";
import Package from "./pages/Package";
import RatingsPage from "./pages/RatingsPage";
import Booking from "./pages/user/Booking";
import Search from "./pages/Search";
import StripeCheckout from "./pages/user/StripeCheckout";
import GuideApplication from "./pages/GuideApplication";
import AdminHome from "./pages/admin/AdminHome";
import GuideRoute from "./pages/Routes/GuideRoute";
import GuideDashboard from "./pages/guide/GuideDashboard";
import RequestGuide from "./pages/RequestGuide";
import AdminUserView from "./pages/admin/AdminUserView";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";

const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Header />
      <Routes>
        {/* --- PUBLIC ACCESSIBLE ROUTES --- */}
        {/* These must stay outside PrivateRoute to handle external redirects like eSewa */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />

        {/* --- PROTECTED USER ROUTES --- */}
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/package/:id" element={<Package />} />
          <Route path="/package/ratings/:id" element={<RatingsPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/guide-application" element={<GuideApplication />} />
          <Route path="/request-guide" element={<RequestGuide />} />
          <Route path="/profile/user" element={<Profile />} />
          <Route path="/booking/:packageId" element={<Booking />} />
          <Route path="/stripe-checkout" element={<StripeCheckout />} />
        </Route>

        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route path="" element={<AdminHome />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="admin-view" element={<AdminUserView />} />
          <Route path="bookings" element={<AllBookings />} />
          <Route path="packages" element={<AllPackages />} />
          <Route path="packages/add" element={<AddPackages />} />
          <Route path="packages/update/:id" element={<UpdatePackage />} />
          <Route path="users" element={<AllUsers />} />
          <Route path="payments" element={<Payments />} />
          <Route path="ratings" element={<RatingsReviews />} />
          <Route path="history" element={<History />} />
          <Route path="guide-applications" element={<GuideApplications />} />
        </Route>

        {/* --- GUIDE ROUTES --- */}
        <Route path="/guide" element={<GuideRoute />}>
          <Route path="" element={<GuideDashboard />} />
        </Route>

        {/* 404 Fallback - Recommended for Senior Level UX */}
        <Route path="*" element={<div className="p-20 text-center">Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;