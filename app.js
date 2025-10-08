require("dotenv").config(); // Load .env first
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./util/expresserror.js");

const listingRoutes = require("./classroom/routes/listing.js");
const userRouter = require("./classroom/routes/user1.js");
const User = require("./model/user.js");

const MongoStore = require('connect-mongo');
// ------------------- MongoDB Connection -------------------
const MONGO_URL = process.env.ATLASDB_URL;

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}
main();

// ------------------- App Configuration -------------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ------------------- Session & Flash -------------------



const store=MongoStore.create(
  {

    mongoUrl:MONGO_URL,
    touchAfter:24*3600,
    crypto:{
      secret:"mysecretkey"
  }
}
)


store.on("error",function(e){
  console.log("session store error",e)
})


const sessionOptions = {
  store,
  secret: process.env.SECRET || "thisissecret",
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
app.use("/", userRouter);

app.get("/", (req, res) => {
  res.send("🚀 App is running successfully!");
});

// ------------------- Error Handler -------------------
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error.ejs", { err });
});

// ------------------- Start Server -------------------
app.listen(8080, () => {
  console.log("🚀 Server running on http://localhost:8080");
});
