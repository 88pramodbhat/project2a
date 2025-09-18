



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const ExpressError = require("./util/expresserror.js");
const listingRoutes = require("./classroom/routes/listing.js");
const userrouter = require("./classroom/routes/user1.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./model/user.js");

// ------------------- Middleware -------------------
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// ------------------- MongoDB Connection -------------------
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderella");
}
main()
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed", err));

// ------------------- Session & Flash -------------------
const sessionOptions = {
  secret: "thisissecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ------------------- Passport -------------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ------------------- Flash Middleware -------------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// ------------------- Routes -------------------
app.use("/listings", listingRoutes);
app.use("/", userrouter); // ✅ mount user routes

// Root route
app.get("/", (req, res) => {
  res.send("App is listening on the server");
});

// ------------------- Error Handler -------------------
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { err });
});

// ------------------- Start Server -------------------
app.listen(8080, () => {
  console.log("🚀 Server running on http://localhost:8080");
});
