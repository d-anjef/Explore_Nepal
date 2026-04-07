import Package from "../models/package.model.js";
import RatingReview from "../models/ratings_reviews.model.js";
import Booking from "../models/booking.model.js";

export const giveRating = async (req, res) => {
  if (req.user.id !== req.body.userRef) {
    return res.status(401).send({
      success: false,
      message: "You can only give rating on your own account!",
    });
  }

  // Prevent admin from rating packages
  if (req.user.user_role === 1) {
    return res.status(403).send({
      success: false,
      message: "Admins cannot rate packages!",
    });
  }

  try {
    // Check if user has booked this package
    const hasBooked = await Booking.findOne({
      buyer: req.body.userRef,
      packageDetails: req.body.packageId,
    });

    if (!hasBooked) {
      return res.status(403).send({
        success: false,
        message: "You can only rate packages you have booked!",
      });
    }

    // Check if the tour is completed (booking date has passed)
    const bookingDate = new Date(hasBooked.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate >= today) {
      return res.status(403).send({
        success: false,
        message: "You can only rate after your tour is completed!",
      });
    }

    // Check if booking was cancelled
    if (hasBooked.status === "Cancelled") {
      return res.status(403).send({
        success: false,
        message: "You cannot rate a cancelled booking!",
      });
    }

    const newRating = await RatingReview.create(req.body);
    if (newRating) {
      const ratings = await RatingReview.find({
        packageId: req.body.packageId,
      });

      let totalRatings = await ratings.length;
      let totalStars = 0;
      await ratings.map((rating) => {
        totalStars += rating.rating;
      });
      let average_rating =
        (await Math.round((totalStars / totalRatings) * 10)) / 10;
      // console.log("total ratings: " + totalRatings);
      // console.log("total stars: " + totalStars);
      // console.log("average: " + average_rating);

      const setPackageRatings = await Package.findByIdAndUpdate(
        req.body.packageId,
        {
          $set: {
            packageRating: average_rating,
            packageTotalRatings: totalRatings,
          },
        },
        { new: true }
      );

      // console.log(setPackageRatings);

      if (setPackageRatings) {
        return res.status(201).send({
          success: true,
          message: "Thanks for your feedback!",
        });
      } else {
        return res.status(500).send({
          success: false,
          message: "Soemthing went wrong while rating to package!",
        });
      }
    } else {
      return res.status(500).send({
        success: false,
        message: "Soemthing went wrong",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const ratingGiven = async (req, res) => {
  try {
    const rating_given = await RatingReview.findOne({
      userRef: req?.params?.userId,
      packageId: req?.params?.packageId,
    });
    if (rating_given) {
      return res.status(200).send({
        given: true,
      });
    } else {
      return res.status(200).send({
        given: false,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const averageRating = async (req, res) => {
  try {
    const ratings = await RatingReview.find({ packageId: req?.params?.id });
    let totalStars = 0;
    await ratings.map((rating) => {
      totalStars += rating.rating;
    });
    let average = Math.round((totalStars / ratings.length) * 10) / 10;
    if (ratings.length) {
      res.status(200).send({
        rating: average,
        totalRatings: ratings.length,
      });
    } else {
      res.status(200).send({
        rating: 0,
        totalRatings: 0,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getAllRatings = async (req, res) => {
  try {
    const ratings = await RatingReview.find({
      packageId: req?.params?.id,
    })
      .limit(req?.params?.limit)
      .sort({ createdAt: -1 });
    if (ratings) {
      return res.send(ratings);
    } else {
      return res.send("N/A");
    }
  } catch (error) {
    console.log(error);
  }
};
