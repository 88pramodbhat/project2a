const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("./model/listing.js");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderella");
}

main()
  .then(() => {
    console.log("connection established");
  })
  .catch((err) => {
    console.log("connection failed:", err);
  });

const initdb = async () => {
  try {
    await Listing.deleteMany({}); // clear old data

    // Add owner field to every object
    const dataWithOwner = initdata.data.map((obj) => ({
      ...obj,
      owner: "68d41d7b5d4f52daa8bf3342",
    }));

    // Insert updated data
    await Listing.insertMany(dataWithOwner);

    console.log("Database initialized with sample data!");
  } catch (err) {
    console.log("Error initializing DB:", err);
  }
};

initdb();
