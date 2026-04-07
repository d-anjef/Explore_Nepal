import Package from "../models/package.model.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import Booking from "../models/booking.model.js";
dotenv.config();

// payment gateway - Stripe only (Braintree disabled)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//create package
export const createPackage = async (req, res) => {
  try {
    const {
      packageName,
      packageDescription,
      packageDestination,
      packageCategory,
      packageDays,
      packageNights,
      packageAccommodation,
      packageMeals,
      packageActivities,
      packagePrice,
      packageDiscountPrice,
      packageOffer,
      packageImages,
    } = req.body;

    if (
      !packageName ||
      !packageDescription ||
      !packageDestination ||
      !packageCategory ||
      !packageAccommodation ||
      !packageMeals ||
      !packageActivities ||
      !packageImages ||
      packageImages.length === 0
    ) {
      return res.status(200).send({
        success: false,
        message: "All fields are required!",
      });
    }
    if (packagePrice < packageDiscountPrice) {
      return res.status(200).send({
        success: false,
        message: "Regular price should be greater than discount price!",
      });
    }
    if (packagePrice <= 0 || packageDiscountPrice < 0) {
      return res.status(200).send({
        success: false,
        message: "Price should be greater than 0!",
      });
    }
    if (packageDays <= 0 && packageNights <= 0) {
      return res.status(200).send({
        success: false,
        message: "Provide days and nights!",
      });
    }

    const newPackage = await Package.create(req.body);
    if (newPackage) {
      return res.status(201).send({
        success: true,
        message: "Package added successfully!",
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "Something went wrong",
      });
    }
  } catch (error) {
    console.log("Error creating package:", error);
    return res.status(500).send({
      success: false,
      message: error.message || "Failed to create package",
    });
  }
};

//get all packages
export const getPackages = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm || "";
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    let offer = req.query.offer;
    if (offer === undefined || offer === "false") {
      offer = { $in: [false, true] };
    }

    const sort = req.query.sort || "createdAt";

    const order = req.query.order || "desc";

    const packages = await Package.find({
      $or: [
        { packageName: { $regex: searchTerm, $options: "i" } },
        { packageDestination: { $regex: searchTerm, $options: "i" } },
      ],
      packageOffer: offer,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);
    if (packages) {
      return res.status(200).send({
        success: true,
        packages,
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "No Packages yet",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//get package data
export const getPackageData = async (req, res) => {
  try {
    const packageData = await Package.findById(req?.params?.id);
    if (!packageData) {
      return res.status(404).send({
        success: false,
        message: "Package not found!",
      });
    }
    return res.status(200).send({
      success: true,
      packageData,
    });
  } catch (error) {
    console.log(error);
  }
};

//update package
export const updatePackage = async (req, res) => {
  try {
    const findPackage = await Package.findById(req.params.id);
    if (!findPackage)
      return res.status(404).send({
        success: false,
        message: "Package not found!",
      });

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Package updated successfully!",
      updatedPackage,
    });
  } catch (error) {
    console.log(error);
  }
};

//delete package
export const deletePackage = async (req, res) => {
  try {
    const deletePackage = await Package.findByIdAndDelete(req?.params?.id);
    return res.status(200).send({
      success: true,
      message: "Package Deleted!",
    });
  } catch (error) {
    console.log(error);
  }
};

//get recommended packages
export const getRecommendedPackages = async (req, res) => {
  try {
    const userId = req.query.userId;
    const limit = parseInt(req.query.limit) || 12;

    // Get all packages
    const packages = await Package.find({});

    // Get user's booking history if userId is provided
    let userBookings = [];
    let bookedPackageIds = [];
    if (userId) {
      userBookings = await Booking.find({ buyer: userId }).populate(
        "packageDetails"
      );
      // Get IDs of packages the user has already booked
      bookedPackageIds = userBookings
        .map((b) => b.packageDetails?._id?.toString())
        .filter(Boolean);
    }

    // Filter out packages the user has already booked
    const availablePackages = packages.filter(
      (pkg) => !bookedPackageIds.includes(pkg._id.toString())
    );

    // Check if user is first-time (no bookings)
    const isFirstTimeUser = userId && userBookings.length === 0;

    // Collaborative Filtering: Find packages based on what other users booked
    let collaborativeScores = {};
    
    if (userId) {
      if (userBookings.length > 0) {
        // For users with bookings: Find similar users based on category preferences
        const userCategories = userBookings
          .map((b) => b.packageDetails?.packageCategory)
          .filter(Boolean);

        if (userCategories.length > 0) {
          // Find other users who booked packages in the same categories
          const similarUserBookings = await Booking.find({
            buyer: { $ne: userId }, // Exclude current user
          }).populate("packageDetails");

          // Calculate similarity scores for other users
          const userSimilarity = {};
          similarUserBookings.forEach((booking) => {
            const otherUserId = booking.buyer.toString();
            const category = booking.packageDetails?.packageCategory;

            if (category && userCategories.includes(category)) {
              if (!userSimilarity[otherUserId]) {
                userSimilarity[otherUserId] = 0;
              }
              userSimilarity[otherUserId]++;
            }
          });

          // Get packages booked by similar users (weighted by similarity)
          Object.keys(userSimilarity).forEach((similarUserId) => {
            const similarityScore = userSimilarity[similarUserId];
            const theirBookings = similarUserBookings.filter(
              (b) => b.buyer.toString() === similarUserId
            );

            theirBookings.forEach((booking) => {
              const pkgId = booking.packageDetails?._id?.toString();
              if (pkgId && !bookedPackageIds.includes(pkgId)) {
                if (!collaborativeScores[pkgId]) {
                  collaborativeScores[pkgId] = 0;
                }
                // Add bonus weighted by similarity (max 25 points)
                collaborativeScores[pkgId] += Math.min(
                  similarityScore * 5,
                  25
                );
              }
            });
          });
        }
      } else {
        // For first-time users: Use advanced collaborative filtering
        // Find packages that users frequently book together
        const allBookings = await Booking.find({}).populate("packageDetails");
        
        // Group bookings by user to find co-occurrence patterns
        const userBookings = {};
        allBookings.forEach((booking) => {
          const userId = booking.buyer.toString();
          const pkgId = booking.packageDetails?._id?.toString();
          
          if (pkgId) {
            if (!userBookings[userId]) {
              userBookings[userId] = [];
            }
            userBookings[userId].push(pkgId);
          }
        });

        // Calculate package co-occurrence matrix (ONLY co-occurrence analysis)
        // If users A and B both book package X, then package X gets higher score
        const packageCoOccurrence = {};

        // Calculate co-occurrence scores
        // For each pair of users, find common packages they booked
        const userIds = Object.keys(userBookings);
        for (let i = 0; i < userIds.length; i++) {
          for (let j = i + 1; j < userIds.length; j++) {
            const user1Packages = userBookings[userIds[i]];
            const user2Packages = userBookings[userIds[j]];
            
            // Find packages both users booked
            const commonPackages = user1Packages.filter(pkg => 
              user2Packages.includes(pkg)
            );
            
            // Boost score for packages that multiple users booked together
            commonPackages.forEach((pkgId) => {
              if (!packageCoOccurrence[pkgId]) {
                packageCoOccurrence[pkgId] = 0;
              }
              // 20 points per user pair that booked this package together
              packageCoOccurrence[pkgId] += 20;
            });
          }
        }

        // Assign collaborative scores based ONLY on co-occurrence
        Object.keys(packageCoOccurrence).forEach((pkgId) => {
          // Use only co-occurrence score (max 100 points)
          collaborativeScores[pkgId] = Math.min(packageCoOccurrence[pkgId], 100);
        });


      }
    }

    // Calculate recommendation score for each package
    const scoredPackages = availablePackages.map((pkg) => {
      let score = 0;
      const pkgId = pkg._id.toString();

      // For first-time users: ONLY use collaborative filtering (popularity-based)
      if (isFirstTimeUser) {
        // Use only collaborative scores based on what other users booked
        score = collaborativeScores[pkgId] || 0;
        
        // If no collaborative data, use basic rating as fallback
        if (score === 0) {
          score = (pkg.packageRating / 5) * 20;
        }

      } else {
        // For returning users: category-focused scoring + collaborative filtering
        // Rating factor (0-50 points): Higher rating = higher score
        const ratingScore = (pkg.packageRating / 5) * 50;
        score += ratingScore;

        // Price factor (0-20 points): Better value = higher score
        let priceScore = 0;
        if (pkg.packageOffer && pkg.packageDiscountPrice > 0) {
          const discount =
            ((pkg.packagePrice - pkg.packageDiscountPrice) / pkg.packagePrice) *
            100;
          priceScore = Math.min((discount / 50) * 20, 20);
        } else {
          // Reward lower-priced packages
          priceScore = Math.max(20 - pkg.packagePrice / 1000, 0);
        }
        score += priceScore;

        // User preference bonus (0-75 points): Based on user's booking history
        if (userId && userBookings.length > 0) {
          const userCategories = userBookings.map(
            (b) => b.packageDetails?.packageCategory
          ).filter(Boolean);
          const userPriceRange = userBookings.map(
            (b) => b.packageDetails?.packagePrice || 0
          );
          const avgUserPrice =
            userPriceRange.reduce((a, b) => a + b, 0) / userPriceRange.length;

          // Very strong bonus for matching categories (0-65 points) - MAXIMUM PRIORITY!
          // Count how many times user booked this category
          const categoryCount = userCategories.filter(
            (cat) => cat === pkg.packageCategory
          ).length;
          
          if (categoryCount > 0) {
            // More bookings in same category = higher score
            // Base 30 points + up to 35 more based on frequency
            score += Math.min(30 + (categoryCount * 12), 65);
          }

          // Bonus for similar price range (0-10 points)
          if (
            pkg.packagePrice >= avgUserPrice * 0.7 &&
            pkg.packagePrice <= avgUserPrice * 1.3
          ) {
            score += 10;
          }
        }

        // Apply collaborative filtering bonus (0-25 points)
        if (collaborativeScores[pkgId]) {
          score += collaborativeScores[pkgId];
        }
      }

      return {
        ...pkg.toObject(),
        recommendationScore: score,
      };
    });

    // Sort by recommendation score and return top packages
    const recommendedPackages = scoredPackages
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);

    return res.status(200).send({
      success: true,
      packages: recommendedPackages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error fetching recommendations",
    });
  }
};

// payment gateway api - Stripe
//create payment intent
export const stripePaymentIntentController = async (req, res) => {
  try {
    const { amount, packageId, packageName } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).send({
        success: false,
        message: "Invalid amount",
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: "usd",
      metadata: {
        packageId: packageId || "",
        packageName: packageName || "",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).send({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

//get stripe publishable key
export const stripePublishableKeyController = async (req, res) => {
  try {
    res.status(200).send({
      success: true,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching publishable key",
    });
  }
};

//verify stripe payment
export const verifyStripePayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).send({
        success: false,
        message: "Payment Intent ID is required",
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      return res.status(200).send({
        success: true,
        message: "Payment verified successfully",
        paymentIntent,
      });
    } else {
      return res.status(400).send({
        success: false,
        message: "Payment not completed",
        status: paymentIntent.status,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};
