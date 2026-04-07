import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate, useLocation } from "react-router-dom"; // Added useLocation
import Spinner from "../components/Spinner";

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const authCheck = async () => {
    try {
      const res = await fetch("/api/user/user-auth", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      if (data.check) {
        setOk(true);
      } else {
        setOk(false);
      }
    } catch (error) {
      setOk(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we are on the success page, we let the component handle its own logic 
    // and don't trigger the global auth check here.
    if (location.pathname === "/payment-success") {
      setLoading(false);
      setOk(true);
      return;
    }

    if (currentUser !== null) {
      authCheck();
    } else {
      // Add a small delay to allow Redux Persist to hydrate if you're using it
      const timeout = setTimeout(() => {
        setLoading(false);
        setOk(false);
      }, 500); 
      return () => clearTimeout(timeout);
    }
  }, [currentUser, location.pathname]);

  if (loading) return <Spinner />;
  
  return ok ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}