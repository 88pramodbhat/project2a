const express = require("express");
const router = express.Router();

const wrapAsync = require("../../util/wrap.js");
const { listingSchema, reviewSchema } = require("../../schema.js");
const ExpressError = require("../../util/expresserror.js");

const Listing = require("../../model/listing.js");
const Review = require("../../model/review.js");
const { isloggedin } = require("../../middleware.js");

// ------------------- Validation Middlewares -------------------
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

// Index - show all listings
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const all_listings = await Listing.find({});
    res.render("listings/index.ejs", { all_listings });
  })
);

// New - form to create listing
router.get("/new", isloggedin, (req, res) => {
  res.render("listings/new.ejs");
});

// Create - add new listing
router.post(
  "/",
  isloggedin,
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listings);
    await newListing.save();
    req.flash("success", "Successfully saved the listing");
    res.redirect("/listings");
  })
);

// Show - details for one listing
router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listings = await Listing.findById(id).populate("reviews");

    if (!listings) {
      return next(new ExpressError("Listing not found", 404));
    }

    res.render("listings/show.ejs", { listings });
  })
);

// Edit - form to edit listing
router.get(
  "/:id/edit",
  isloggedin,
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return next(new ExpressError("Listing not found", 404));
    }
    res.render("listings/edit.ejs", { listing });
  })
);

// Update listing
router.put(
  "/:id",
  isloggedin,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listings });
    req.flash("success", "Successfully updated the listing");
    res.redirect(`/listings/${id}`);
  })
);

// Delete listing
router.delete(
  "/:id",
  isloggedin,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the listing");
    res.redirect("/listings");
  })
);

// ------------------- Reviews -------------------

// Create a review
router.post(
  "/:id/reviews",
  isloggedin,
  validateReview,
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;

    let listing = await Listing.findById(id);
    if (!listing) {
      return next(new ExpressError("Listing not found", 404));
    }

    let newReview = new Review(req.body.review);
    await newReview.save();

    listing.reviews.push(newReview);
    await listing.save();

    req.flash("success", "Successfully added the review");
    res.redirect(`/listings/${listing._id}`);
  })
);

// Delete a review
router.delete(
  "/:id/reviews/:reviewId",
  isloggedin,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Successfully deleted the review");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
