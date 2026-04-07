import GuideMessage from "../models/guideMessage.model.js";

// Send message to guide
export const sendMessageToGuide = async (req, res) => {
  try {
    const {
      guideId,
      guideName,
      guideEmail,
      userName,
      userEmail,
      userPhone,
      message,
      tourDays,
      tourDate,
    } = req.body;

    if (
      !guideId ||
      !guideName ||
      !guideEmail ||
      !userName ||
      !userEmail ||
      !userPhone ||
      !message ||
      !tourDays ||
      !tourDate
    ) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    const newMessage = await GuideMessage.create(req.body);

    if (newMessage) {
      return res.status(201).send({
        success: true,
        message: "Message sent successfully to the guide!",
        data: newMessage,
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "Failed to send message",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};

// Get messages for a specific guide (by email)
export const getGuideMessages = async (req, res) => {
  try {
    const { guideEmail } = req.params;

    const messages = await GuideMessage.find({ guideEmail }).sort({
      createdAt: -1,
    });

    return res.status(200).send({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};

// Get messages sent by a user (for notifications)
export const getUserMessages = async (req, res) => {
  try {
    const { userEmail } = req.params;

    const messages = await GuideMessage.find({ userEmail }).sort({
      createdAt: -1,
    });

    return res.status(200).send({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedMessage = await GuideMessage.findByIdAndUpdate(
      id,
      { status: "read" },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).send({
        success: false,
        message: "Message not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Message marked as read",
      data: updatedMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};

// Update message status (approve/reject)
export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).send({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'",
      });
    }

    const updatedMessage = await GuideMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).send({
        success: false,
        message: "Message not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: `Message ${status} successfully`,
      data: updatedMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};

// Delete message
export const deleteGuideMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMessage = await GuideMessage.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).send({
        success: false,
        message: "Message not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};

// Get all messages (for admin)
export const getAllMessages = async (req, res) => {
  try {
    const messages = await GuideMessage.find().sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};
