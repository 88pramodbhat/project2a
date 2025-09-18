const mongoose = require("mongoose");
const initdata = require("./data.js");
const listing = require("./model/listing.js");

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
  await listing.deleteMany({});
  await listing.insertMany(initdata.data);
};

initdb(); // Don't forget to call it if you want it to run
