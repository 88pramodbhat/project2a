const express = require("express");
const router = express.Router();
const wrapAsync = require("../../util/wrap.js");
const { listingSchema, reviewSchema } = require("../../schema.js");
const ExpressError = require("../../util/expresserror.js");
const Listing = require("../../model/listing.js");
const Review = require("../../model/review.js");
const { isloggedin } = require("../../middleware.js");
const listingsController = require("../../controllers/listings.js");

// ------------------- Validation -------------------
function validateListing(req, res, next) {
  const { error } = listingSchema.validate(req.body.listings);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    return next(new ExpressError(msg, 400));
  }
  next();
}

function validateReview(req, res, next) {
  const { error } = reviewSchema.validate(req.body.review);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    return next(new ExpressError(msg, 400));
  }
  next();
}

// ------------------- Routes -------------------

// Index
router.get("/", wrapAsync(listingsController.index));

// New
router.get("/new", isloggedin, (req, res) => {
  res.render("listings/new.ejs");
});

// Create
router.post(
  "/",
  isloggedin,
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listings);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Successfully created listing!");
    res.redirect("/listings");
  })
);

// Show
router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listings = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");
    if (!listings) return next(new ExpressError("Listing not found", 404));
    res.render("listings/show.ejs", { listings });
  })
);

// Edit
router.get(
  "/:id/edit",
  isloggedin,
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return next(new ExpressError("Listing not found", 404));
    res.render("listings/edit.ejs", { listing });
  })
);

// Update
router.put(
  "/:id",
  isloggedin,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listings });
    req.flash("success", "Successfully updated listing!");
    res.redirect(`/listings/${id}`);
  })
);

// Delete
router.delete(
  "/:id",
  isloggedin,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
  })
);

// Reviews
router.post(
  "/:id/reviews",
  isloggedin,
  validateReview,
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return next(new ExpressError("Listing not found", 404));

    const newReview = new Review(req.body.review);
    newReview.owner = req.user._id;
    await newReview.save();

    listing.reviews.push(newReview._id);
    await listing.save();

    req.flash("success", "Review added successfully!");
    res.redirect(`/listings/${listing._id}`);
  })
);

router.delete(
  "/:id/reviews/:reviewId",
  isloggedin,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
