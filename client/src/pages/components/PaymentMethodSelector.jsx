import React, { useState } from "react";

const PaymentMethodSelector = ({ onSelectMethod }) => {
  const [selectedMethod, setSelectedMethod] = useState("stripe");

  const handleMethodChange = (method) => {
    setSelectedMethod(method);
    onSelectMethod(method);
  };

  return (
    <div className="payment-method-selector p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Select Payment Method</h3>
      
      <div className="flex flex-col gap-3">
        {/* Stripe Option */}
        <div
          className={`payment-option p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === "stripe"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-300"
          }`}
          onClick={() => handleMethodChange("stripe")}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="paymentMethod"
              value="stripe"
              checked={selectedMethod === "stripe"}
              onChange={() => handleMethodChange("stripe")}
              className="w-5 h-5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">Stripe</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Recommended
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Credit/Debit Card, Apple Pay, Google Pay
              </p>
            </div>
            <div className="flex gap-1">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png"
                alt="Visa"
                className="h-6"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png"
                alt="Mastercard"
                className="h-6"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png"
                alt="Amex"
                className="h-6"
              />
            </div>
          </div>
        </div>

        {/* Braintree Option */}
        <div
          className={`payment-option p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === "braintree"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-300"
          }`}
          onClick={() => handleMethodChange("braintree")}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="paymentMethod"
              value="braintree"
              checked={selectedMethod === "braintree"}
              onChange={() => handleMethodChange("braintree")}
              className="w-5 h-5"
            />
            <div className="flex-1">
              <span className="font-semibold text-lg">Braintree</span>
              <p className="text-sm text-gray-600 mt-1">
                PayPal, Venmo, Credit/Debit Card
              </p>
            </div>
            <div className="flex gap-1">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/200px-PayPal.svg.png"
                alt="PayPal"
                className="h-6"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          🔒 Your payment information is secure and encrypted. We never store
          your card details.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
