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
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Protected routes - require authentication */}
        <Route path="/home" element={<PrivateRoute />}>
          <Route path="" element={<Home />} />
        </Route>
        <Route path="/search" element={<PrivateRoute />}>
          <Route path="" element={<Search />} />
        </Route>
        <Route path="/package/:id" element={<PrivateRoute />}>
          <Route path="" element={<Package />} />
        </Route>
        <Route path="/package/ratings/:id" element={<PrivateRoute />}>
          <Route path="" element={<RatingsPage />} />
        </Route>
        <Route path="/about" element={<PrivateRoute />}>
          <Route path="" element={<About />} />
        </Route>
        <Route path="/guide-application" element={<PrivateRoute />}>
          <Route path="" element={<GuideApplication />} />
        </Route>
        <Route path="/request-guide" element={<PrivateRoute />}>
          <Route path="" element={<RequestGuide />} />
        </Route>
        {/* user */}
        <Route path="/profile" element={<PrivateRoute />}>
          <Route path="user" element={<Profile />} />
          
        </Route>
         <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failure" element={<PaymentFailure />} />
        {/* admin - dedicated routes */}
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

        {/* guide - dedicated routes */}
        <Route path="/guide" element={<GuideRoute />}>
          <Route path="" element={<GuideDashboard />} />
        </Route>
        {/* checking user auth before booking */}
        <Route path="/booking" element={<PrivateRoute />}>
          <Route path=":packageId" element={<Booking />} />
        </Route>
        {/* stripe checkout */}
        <Route path="/stripe-checkout" element={<PrivateRoute />}>
          <Route path="" element={<StripeCheckout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
