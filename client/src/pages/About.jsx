import aboutImg from "../assets/images/about_img.png";
import { FaExternalLinkAlt, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "./styles/About.css";

const About = () => {
  return (
    <div className="w-full">
      {/* Hero Section with Background Image */}
      <div className="relative w-full">
        <div className="about_background_image w-full"></div>
        <div className="about_hero_content w-full">
          <h1 className="text-4xl sm:text-5xl font-bold text-white text-center mb-4">
            About Explore Nepal
          </h1>
          <p className="text-lg sm:text-xl text-white text-center max-w-2xl mx-auto">
            Your trusted partner for unforgettable Nepal adventures
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full bg-slate-50 px-4 sm:px-6 py-10 flex justify-center">
        <div className="w-full max-w-4xl">
        {/* Text / site description */}
        <section className="space-y-6 text-center">
          <header className="space-y-3">
            {/* <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-500">
              About us
            </p> */}
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">
              We make travel planning simple and inspiring
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              The Travel Index is a modern travel platform built to help you
              discover, compare and book the right tour package in just a few
              clicks. We bring together trusted operators, real guest feedback
              and clear pricing so planning your next trip feels effortless.
            </p>
          </header>

          <div className="grid sm:grid-cols-2 gap-6 text-left text-sm sm:text-base max-w-3xl mx-auto">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">
                For travellers
              </h2>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                <li>Explore curated tour packages for every budget and style.</li>
                <li>Compare options using ratings, reviews and real trip data.</li>
                <li>Search quickly by destination, dates, budget or trip type.</li>
                <li>Book securely and keep all your trips in one place.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">
                For our partners
              </h2>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                <li>Manage packages, pricing, offers and availability in one dashboard.</li>
                <li>Track bookings, payments and guest history in real time.</li>
                <li>Use ratings and reviews to improve experiences and build trust.</li>
                <li>Review and approve local guide applications to grow your team.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="mt-12 bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Get in Touch
            </h2>
            <p className="text-slate-600">
              Have questions? We're here to help you plan your perfect Nepal adventure
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Email Section */}
            <div className="bg-blue-50 rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-3 rounded-full">
                  <FaEnvelope className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Email Us</h3>
              </div>
              <div className="space-y-2 pl-14">
                <a
                  href="mailto:explore_nepal12@gmail.com"
                  className="block text-blue-600 hover:underline font-medium"
                >
                  explore_nepal12@gmail.com
                </a>
                <a
                  href="mailto:info@explorenepal.com"
                  className="block text-blue-600 hover:underline font-medium"
                >
                  info@explorenepal.com
                </a>
              </div>
            </div>

            {/* Phone Section */}
            <div className="bg-emerald-50 rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-3 rounded-full">
                  <FaPhone className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Call Us</h3>
              </div>
              <div className="space-y-2 pl-14">
                <a
                  href="tel:+9779841234567"
                  className="block text-emerald-600 hover:underline font-medium"
                >
                  +977 984-1234567
                </a>
                <a
                  href="tel:+9779851234568"
                  className="block text-emerald-600 hover:underline font-medium"
                >
                  +977 985-1234568
                </a>
                <a
                  href="tel:+9779861234569"
                  className="block text-emerald-600 hover:underline font-medium"
                >
                  +977 986-1234569
                </a>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="mt-6 bg-slate-50 rounded-lg p-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="bg-slate-600 p-3 rounded-full">
                <FaMapMarkerAlt className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Visit Us</h3>
                <p className="text-slate-600">
                  Thamel, Kathmandu, Nepal<br />
                  Open: Monday - Saturday, 9:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
};

export default About;
