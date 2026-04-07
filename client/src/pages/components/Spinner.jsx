import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Spinner = ({ path = "login" }) => {
  const [count, setCount] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // PREVENT REDIRECT IF VERIFYING PAYMENT
    if (location.pathname === "/payment-success") {
      return; 
    }

    const interval = setInterval(() => {
      setCount((prevValue) => prevValue - 1);
    }, 1000);

    if (count === 0) {
      navigate(`/${path}`, {
        state: location.pathname,
      });
    }

    return () => clearInterval(interval);
  }, [count, navigate, location, path]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-white">
      <h1 className="text-center text-2xl mb-4 font-semibold text-gray-700">
        {location.pathname === "/payment-success" 
          ? "Finalizing your transaction..." 
          : `Redirecting you in ${count}`}
      </h1>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
    </div>
  );
};

export default Spinner;