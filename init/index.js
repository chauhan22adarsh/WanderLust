const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("🌱 Database initialized with sample listings");
  } catch (err) {
    console.error("❌ Error seeding DB:", err.message);
  }
};

module.exports = initDB;
