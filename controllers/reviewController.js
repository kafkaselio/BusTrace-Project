/**
 * reviewController.js
 *
 * FIXES APPLIED:
 *  - createReview: validates that busId exists in DB before creating review
 *    (previously accepted any arbitrary busId string)
 */

const Review = require("../models/Review");
const Bus = require("../models/Bus");

// POST /api/reviews
async function createReview(req, res, next) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to submit a review.",
      });
    }

    const { busId, routeId, rating, comment, tags } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    // FIX: validate busId exists in DB — was previously unchecked
    if (busId) {
      const busExists = await Bus.exists({ busId });
      if (!busExists) {
        return res.status(404).json({
          success: false,
          message: `Bus "${busId}" not found. Check the Bus ID and try again.`,
        });
      }
    }

    const review = await Review.create({
      userId: req.session.userId,
      busId,
      routeId,
      rating,
      comment,
      tags,
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews?busId=&routeId=
async function getReviews(req, res, next) {
  try {
    const filter = {};
    if (req.query.busId) filter.busId = req.query.busId;
    if (req.query.routeId) filter.routeId = req.query.routeId;

    const reviews = await Review.find(filter)
      .populate("userId", "name phone")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const avgRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : null;

    res.json({ success: true, count: reviews.length, avgRating, data: reviews });
  } catch (err) {
    next(err);
  }
}

module.exports = { createReview, getReviews };