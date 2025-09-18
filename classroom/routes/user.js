const express = require("express");
const router = express.Router();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

const app = express();

app.use(session({
    secret: "my secret session",
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../../views"));

app.get("/reqcount", (req, res) => {
    if (req.session.count) {
        req.session.count += 1;
    } else {
        req.session.count = 1;
    }
    res.send(`you sent a request ${req.session.count} times`);
});

app.get("/register", (req, res) => {
    let { name = "anonymous" } = req.query;
    req.session.name = name; // save name in session

    if (name == "anonymous") {
        req.flash("error", "user not registered");
    } else {
        req.flash("success", "user registered successfully");
    }
    console.log(req.query);
    res.redirect("/hello");
});

app.get("/hello", (req, res) => {
    const success = req.flash("success"); // fetch success
    const error = req.flash("error");     // fetch error

    console.log("Success:", success);
    console.log("Error:", error);

    res.render("page.ejs", {
        name: req.session.name || "Guest",
        success: success[0],
        error: error[0]
    });
});

app.listen(8080, () => {
    console.log("🚀 Server running on http://localhost:8080");
});

module.exports = router;
