import GuideJobApplication from "../models/guideJobApplication.model.js";

// Submit guide application
export const submitGuideApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      dateOfBirth,
      experience,
      languages,
      coverLetter,
      resume, // Received from frontend
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !dateOfBirth ||
      !experience ||
      !languages ||
      !coverLetter ||
      !resume // Validate resume
    ) {
      return res.status(400).send({
        success: false,
        message: "All required fields, including your CV, must be provided!",
      });
    }

    const newApplication = await GuideJobApplication.create(req.body);

    if (newApplication) {
      return res.status(201).send({
        success: true,
        message: "Application submitted successfully!",
        application: newApplication,
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "Failed to submit application",
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
// Get all guide applications (Admin only)
export const getAllGuideApplications = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm || "";
    const status = req.query.status || "";

    let query = {
      $or: [
        { fullName: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ],
    };

    if (status && status !== "all") {
      query.status = status;
    }

    const applications = await GuideJobApplication.find(query).sort({
      createdAt: -1,
    });

    if (applications.length > 0) {
      return res.status(200).send({
        success: true,
        applications,
      });
    } else {
      return res.status(200).send({
        success: false,
        message: "No applications found",
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

// Get single application by ID
export const getGuideApplicationById = async (req, res) => {
  try {
    const application = await GuideJobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).send({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).send({
      success: true,
      application,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};

// Update application status (Admin only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).send({
        success: false,
        message: "Invalid status",
      });
    }

    const updatedApplication = await GuideJobApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).send({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Application status updated successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};

// Delete application (Admin only)
export const deleteGuideApplication = async (req, res) => {
  try {
    const deletedApplication = await GuideJobApplication.findByIdAndDelete(
      req.params.id
    );

    if (!deletedApplication) {
      return res.status(404).send({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};

// Get approved guides (Public - for users to view)
export const getApprovedGuides = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm || "";
    const languages = req.query.languages || "";

    let query = {
      status: "approved",
    };

    if (searchTerm) {
      query.$or = [
        { fullName: { $regex: searchTerm, $options: "i" } },
        { languages: { $regex: searchTerm, $options: "i" } },
        { address: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (languages) {
      query.languages = { $regex: languages, $options: "i" };
    }

    const guides = await GuideJobApplication.find(query)
      .select("-coverLetter -resume -createdAt -updatedAt")
      .sort({ experience: -1 });

    return res.status(200).send({
      success: true,
      guides,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};

// Check if user has an approved guide application (by email)
export const checkGuideStatus = async (req, res) => {
  try {
    const { email } = req.params;

    const application = await GuideJobApplication.findOne({ email });

    if (!application) {
      return res.status(200).send({
        success: true,
        hasApplication: false,
        status: null,
      });
    }

    return res.status(200).send({
      success: true,
      hasApplication: true,
      status: application.status,
      application,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};
