import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import MyBookings from "./user/MyBookings";
import UpdateProfile from "./user/UpdateProfile";
import MyHistory from "./user/MyHistory";

const Profile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [activePanelId, setActivePanelId] = useState(1);
  const [hasGuideApplication, setHasGuideApplication] = useState(false);

  useEffect(() => {
    if (currentUser !== null) {
      // Check if user has submitted a guide application
      checkGuideApplication();
      
      // Check for guide request prompt
      const guidePromptData = sessionStorage.getItem("guideRequestPrompt");
      if (guidePromptData) {
        const promptData = JSON.parse(guidePromptData);
        sessionStorage.removeItem("guideRequestPrompt");
        
        // Show guide request prompt after a short delay
        setTimeout(() => {
          toast(
            (t) => (
              <div className="flex flex-col gap-3">
                <p className="font-semibold">Do you want to request a guide for your tour?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      navigate("/request-guide", {
                        state: promptData,
                      });
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Yes, Request Guide
                  </button>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                  >
                    No, Thanks
                  </button>
                </div>
              </div>
            ),
            {
              duration: 10000,
              position: "top-center",
            }
          );
        }, 500);
      }
    }
  }, [currentUser, navigate]);

  const checkGuideApplication = async () => {
    if (!currentUser?.email) return;

    try {
      const res = await fetch(
        `/api/guide-application/check-guide-status/${currentUser.email}`
      );
      const data = await res.json();

      if (data.success && data.hasApplication) {
        setHasGuideApplication(true);
      } else {
        setHasGuideApplication(false);
      }
    } catch (error) {
      console.log(error);
      setHasGuideApplication(false);
    }
  };



  return (
    <div className="w-full">
      {currentUser ? (
        <div className="w-full">
          <nav className="w-full">
            <div className="max-w-6xl mx-auto px-4 border-blue-500 border-b-4">
              <div className="flex gap-2">
                <button
                  className={
                    activePanelId === 1
                      ? "px-4 py-2 rounded-t transition-all duration-300 bg-blue-500 text-white font-medium"
                      : "px-4 py-2 rounded-t transition-all duration-300 hover:bg-gray-100 font-medium"
                  }
                  id="bookings"
                  onClick={() => setActivePanelId(1)}
                >
                  Bookings
                </button>
                <button
                  className={
                    activePanelId === 2
                      ? "px-4 py-2 rounded-t transition-all duration-300 bg-blue-500 text-white font-medium"
                      : "px-4 py-2 rounded-t transition-all duration-300 hover:bg-gray-100 font-medium"
                  }
                  id="updateProfile"
                  onClick={() => setActivePanelId(2)}
                >
                  History
                </button>
                {!hasGuideApplication && (
                  <Link
                    to="/guide-application"
                    className="px-4 py-2 rounded-t transition-all duration-300 bg-green-600 text-white hover:bg-green-700 font-medium"
                  >
                    Guide Application
                  </Link>
                )}
              </div>
            </div>
          </nav>
          {/* bookings */}
          <div className="main flex flex-wrap">
            {activePanelId === 1 && <MyBookings />}
            {/* History */}
            {activePanelId === 2 && <MyHistory />}
            {/* Update profile */}
            {activePanelId === 3 && <UpdateProfile />}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-red-700">Login First</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
