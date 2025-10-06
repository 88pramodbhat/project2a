const express = require("express");
const path = require("path");
const router = express.Router();
const User = require("../../model/user.js");
const passport = require("passport");
const { saveredirectUrl } = require("../../middleware.js");

// Middleware
router.use(express.urlencoded({ extended: true }));

// ---------------- SIGNUP ----------------
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log("✅ Registered User:", registeredUser);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderella!");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
    console.log("❌ Signup Error:", err);
  }
});

// ---------------- LOGIN ----------------
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",saveredirectUrl,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.redirectUrl || "/listings";
    delete req.session.redirectUrl; // clear after using
    res.redirect(res.locals.redirectUrl);
  }
);

// ---------------- LOGOUT ----------------
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully");
    res.redirect("/listings");
  });
});

module.exports = router;
