import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLanguage, FaCertificate, FaBriefcase } from "react-icons/fa";

const RequestGuide = () => {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [tourDays, setTourDays] = useState("");
  const [tourDate, setTourDate] = useState("");
  const [sending, setSending] = useState(false);
  const [guideBookings, setGuideBookings] = useState({});

  // Auto-fill tour details from booking if available
  useEffect(() => {
    if (location.state?.duration) {
      setTourDays(location.state.duration.toString());
    }
    if (location.state?.date) {
      setTourDate(location.state.date);
    }
  }, [location.state]);

  // Check if fields should be read-only (coming from booking)
  const isFromBooking = location.state?.duration && location.state?.date;

  const fetchApprovedGuides = async () => {
    try {
      setLoading(true);
      
      // Fetch booking status for all guides FIRST
      await fetchGuideBookings();
      
      // Fetch approved guides
      const res = await fetch(
        `/api/guide-application/get-approved-guides?searchTerm=${searchTerm}`
      );
      const data = await res.json();

      if (data.success) {
        let acceptedGuideEmails = [];
        
        // Only fetch user messages if user is logged in
        if (currentUser?.email) {
          try {
            const msgRes = await fetch(
              `/api/guide-message/get-user-messages/${currentUser.email}`,
              {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                credentials: "include",
              }
            );
            const msgData = await msgRes.json();

            if (msgData.success) {
              acceptedGuideEmails = msgData.messages
                .filter((msg) => msg.status === "approved")
                .map((msg) => msg.guideEmail);
            }
          } catch (msgError) {
            console.log("Error fetching user messages:", msgError);
            // Continue without filtering - just show all guides
          }
        }

        // Filter out the current user's own guide profile and guides who already accepted
        const filteredGuides = (data.guides || []).filter(
          (guide) =>
            guide && 
            guide.email && 
            guide.email !== currentUser?.email &&
            !acceptedGuideEmails.includes(guide.email)
        );
        setGuides(filteredGuides);
      } else {
        setGuides([]);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch guides");
    } finally {
      setLoading(false);
    }
  };

  const fetchGuideBookings = async () => {
    try {
      // Only fetch guide bookings if user is logged in
      if (!currentUser?.email) {
        setGuideBookings({});
        return;
      }

      // Get all guide messages
      const res = await fetch('/api/guide-message/get-all-messages', {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        // Create a map of guide emails to their ACTIVE bookings count
        const bookingsMap = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
        
        data.messages.forEach((msg) => {
          if (msg.status === 'approved' && msg.tourDate && msg.tourDays) {
            const tourStartDate = new Date(msg.tourDate);
            tourStartDate.setHours(0, 0, 0, 0);
            
            // Calculate tour end date (start date + duration)
            const tourEndDate = new Date(tourStartDate);
            tourEndDate.setDate(tourEndDate.getDate() + parseInt(msg.tourDays));
            
            // Only count as booked if tour is currently active (today is between start and end date)
            if (today >= tourStartDate && today < tourEndDate) {
              bookingsMap[msg.guideEmail] = (bookingsMap[msg.guideEmail] || 0) + 1;
            }
          }
        });
        setGuideBookings(bookingsMap);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Only fetch guides after initial load
    fetchApprovedGuides();
  }, [searchTerm, currentUser]);

  const handleContactGuide = (guide) => {
    if (!currentUser) {
      toast.error("Please login to contact guides");
      navigate("/login");
      return;
    }
    
    setSelectedGuide(guide);
    setShowModal(true);
    setMessage("");
    // Only reset tour details if they weren't auto-filled from booking
    if (!location.state?.duration) {
      setTourDays("");
    }
    if (!location.state?.date) {
      setTourDate("");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!tourDays || tourDays <= 0) {
      toast.error("Please enter valid tour duration (days)");
      return;
    }

    if (!tourDate) {
      toast.error("Please select a tour date");
      return;
    }

    if (!currentUser) {
      toast.error("Please login to send messages");
      return;
    }

    try {
      setSending(true);
      const res = await fetch("/api/guide-message/send-message", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          guideId: selectedGuide._id,
          guideName: selectedGuide.fullName,
          guideEmail: selectedGuide.email,
          userName: currentUser.username,
          userEmail: currentUser.email,
          userPhone: currentUser.phone,
          message: message,
          tourDays: parseInt(tourDays),
          tourDate: tourDate,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setMessage("");
        setTourDays("");
        setTourDate("");
        setShowModal(false);
        // Navigate to home page after successful request
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Find Your Perfect Guide
          </h1>
          <p className="text-gray-600 text-lg">
            Connect with experienced and certified tour guides for your Nepal adventure
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search by name, language, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg shadow-sm"
            />
          </div>
        </div>

        {/* Guides Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading guides...</p>
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No approved guides found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => {
              const bookingCount = guideBookings[guide.email] || 0;
              const isBooked = bookingCount > 0;
              
              return (
              <div
                key={guide._id}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 relative ${isBooked ? 'opacity-75' : ''}`}
              >
                {isBooked && (
                  <>
                    <div className="absolute top-4 right-4 z-10">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-lg">
                        {bookingCount} Booked
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-5 pointer-events-none z-0"></div>
                  </>
                )}
                
                <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{guide.fullName}</h3>
                  <div className="flex items-center gap-2 text-blue-100">
                    <FaBriefcase />
                    <span>{guide.experience} years experience</span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-gray-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">{guide.address}</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaLanguage className="text-gray-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">{guide.languages}</p>
                  </div>

                  {guide.certifications && (
                    <div className="flex items-start gap-3">
                      <FaCertificate className="text-gray-500 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 text-sm">{guide.certifications}</p>
                    </div>
                  )}

                  {isBooked ? (
                    <button
                      disabled
                      className="w-full mt-4 bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed"
                      title="This guide is currently booked"
                    >
                      Currently Unavailable
                    </button>
                  ) : (
                    <button
                      onClick={() => handleContactGuide(guide)}
                      className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                      Contact Guide
                    </button>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        )}

        {/* Contact Modal */}
        {showModal && selectedGuide && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Contact Guide</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">
                    {selectedGuide.fullName}
                  </h4>
                  <p className="text-gray-600">
                    {selectedGuide.experience} years of experience
                  </p>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-blue-600 text-xl" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a
                        href={`mailto:${selectedGuide.email}`}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        {selectedGuide.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FaPhone className="text-green-600 text-xl" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <a
                        href={`tel:${selectedGuide.phone}`}
                        className="text-green-600 hover:underline font-semibold"
                      >
                        {selectedGuide.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-red-600 text-xl mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="text-gray-800">{selectedGuide.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaLanguage className="text-purple-600 text-xl mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Languages</p>
                      <p className="text-gray-800">{selectedGuide.languages}</p>
                    </div>
                  </div>

                  {selectedGuide.certifications && (
                    <div className="flex items-start gap-3">
                      <FaCertificate className="text-yellow-600 text-xl mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Certifications</p>
                        <p className="text-gray-800">{selectedGuide.certifications}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <div className="space-y-3">
                    {/* Tour Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Tour Duration (Days) *
                        </label>
                        <input
                          type="number"
                          value={tourDays}
                          onChange={(e) => setTourDays(e.target.value)}
                          placeholder="e.g., 5"
                          min="1"
                          readOnly={isFromBooking}
                          className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                            isFromBooking ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Tour Start Date *
                        </label>
                        <input
                          type="date"
                          value={tourDate}
                          onChange={(e) => setTourDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          readOnly={isFromBooking}
                          className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                            isFromBooking ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          required
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Additional Message *
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message here... (e.g., requirements, questions, special requests)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white"
                        rows="3"
                        required
                      />
                    </div>

                    <button
                      onClick={handleSendMessage}
                      disabled={sending}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {sending ? "Sending..." : "Send Request to Guide"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestGuide;