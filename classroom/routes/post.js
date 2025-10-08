const express = require("express");
const router = express.Router();

// GET /posts
router.get("/", (req, res) => {
    res.send("this is post request");
});

// GET /posts/:id
router.get("/:id", (req, res) => {
    res.send("this is post sender id");
});

// POST /posts
router.post("/", (req, res) => {
    res.send("post of posts");
});

// DELETE /posts/:id
router.delete("/:id", (req, res) => {
    res.send("delete the post with id");
});

module.exports = router;
