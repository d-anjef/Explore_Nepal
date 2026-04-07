import crypto from "crypto";

export const initiateEsewaPayment = async (req, res) => {
  try {

    // Get data from frontend
    const { amount, bookingId } = req.body;

    // Create unique transaction id
    const transaction_uuid = bookingId + "-" + Date.now();

    const secret = "8gBm/:&EnhH.1/q";

    const message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=EPAYTEST`;

    const signature = crypto
      .createHmac("sha256", secret)
      .update(message)
      .digest("base64");

    const paymentData = {
      amount: amount,
      tax_amount: 0,
      total_amount: amount,
      transaction_uuid: transaction_uuid, // IMPORTANT
      product_code: "EPAYTEST",
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: "http://localhost:5173/payment-success",
      failure_url: "http://localhost:5173/payment-failure",
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: signature,
    };

    res.json(paymentData);

  } catch (error) {
    console.error("eSewa Error:", error);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};
