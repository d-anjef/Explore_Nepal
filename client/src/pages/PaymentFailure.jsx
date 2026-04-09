import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentFailure = () => {
  const navigate = useNavigate();
  

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <FaTimesCircle className="text-red-500 text-6xl mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Failed ❌</h1>
      <p className="text-gray-600 text-center mb-8">
        Your transaction was cancelled or could not be processed. <br />
        Please try again or choose a different payment method.
      </p>
      
      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)} // Go back to checkout
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
        >
          Try Again
        </button>
        <button
          onClick={() => navigate('/')}
          className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentFailure;