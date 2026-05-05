const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    busId: { type: String },
    routeId: { type: String },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 500, default: "" },
    tags: [{ type: String, enum: ["clean", "punctual", "crowded", "safe", "rude_driver", "comfortable"] }],
  },
  { timestamps: true }
);

// At least one of busId or routeId must be present
reviewSchema.pre("validate", function (next) {
  if (!this.busId && !this.routeId) {
    return next(new Error("Review must reference either a busId or routeId"));
  }
  next();
});

module.exports = mongoose.model("Review", reviewSchema);
