import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";

export default function GuideRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasApplication, setHasApplication] = useState(false);

  const checkGuideApplication = async () => {
    if (!currentUser?.email) {
      setLoading(false);
      setOk(false);
      return;
    }

    try {
      // Check if user has submitted a guide application
      const res = await fetch(
        `/api/guide-application/check-guide-status/${currentUser.email}`
      );
      const data = await res.json();

      if (data.success && data.hasApplication) {
        setHasApplication(true);
        // Now check if they're authenticated as a guide
        const authRes = await fetch("/api/user/guide-auth", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        const authData = await authRes.json();
        if (authData.check) {
          setOk(true);
        } else {
          setOk(false);
        }
      } else {
        setHasApplication(false);
        setOk(false);
        toast.error("First submit guide application");
      }
    } catch (error) {
      console.log(error);
      setOk(false);
      toast.error("First submit guide application");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser !== null) {
      checkGuideApplication();
    } else {
      setLoading(false);
      setOk(false);
    }
  }, [currentUser]);

  if (loading) return <Spinner />;

  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but no application, redirect to guide application form
  if (!hasApplication) {
    return <Navigate to="/guide-application" replace />;
  }

  // If has application, allow access to guide dashboard
  // The guide-auth check is optional - having an application is enough
  return <Outlet />;
}
