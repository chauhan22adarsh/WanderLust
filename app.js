require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";
const port = process.env.port || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");

    const count = await listing.countDocuments();
    if (count === 0) {
      console.log("🌱 No listings found. Seeding...");
      const seedData = require("./init/index.js");
      await seedData();
      console.log("✅ Seeding done");
    } else {
      console.log("✅ Listings already present.");
    }
  } catch (err) {
    console.error("❌ Startup Error:", err.message);
  }
}

main();

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.render("listings/home.ejs");
});

app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const sting = await listing.findById(id);
    res.render("listings/show.ejs", { sting });
  })
);

app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const sting = await listing.findById(id);
    res.render("listings/edit.ejs", { sting });
  })
);

app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let data = req.body.listing;
    data.image.filename = "listingimage";
    await listing.findByIdAndUpdate(
      id,
      { ...data },
      { runValidators: true, new: true }
    );
    res.redirect(`/listings/${id}`);
  })
);

app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

app.all("*", (req, res, next) => {
  throw new ExpressError(404, "Page Not Found!");
});

app.use((err, req, res, next) => {
  if (err.name == "TypeError") {
    throw new ExpressError(
      500,
      "TypeError: Please check your input and try again."
    );
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  res.status(statusCode).render("listings/error.ejs", { message });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
