if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const multer = require("multer");
const { storage } = require("./cloudConfig");
const Resource = require("./models/resource");
const upload = multer({ storage });

const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const resourceRouter = require("./routes/resourceRoutes.js");
const profileRoutes = require('./routes/profile');

const dbUrl = process.env.ATLASDB_URL;
// MongoDB Connection
async function connectDB() {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
}
connectDB();

// Session Store in MongoDB
const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret: process.env.SECRET || "fallbackSecret",
  touchAfter: 24 * 3600,
});

store.on("error", (err) => console.error("MongoDB Session Store Error:", err));

const sessionOptions = {
  store,
  secret: process.env.SECRET || "fallbackSecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Express Middleware
const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(session(sessionOptions));
app.use(flash());

// Ignore /favicon.ico Requests (Fix for your issue)
app.use((req, res, next) => {
  if (req.path === "/favicon.ico") {
    return res.status(204).end(); // No Content Response
  }
  next();
});

// Passport Authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Log Incoming Requests (Exclude /favicon.ico)
app.use((req, res, next) => {
  if (req.path !== "/favicon.ico") {
    console.log(`Request received: ${req.method} ${req.url}`);
  }
  next();
});

// Global Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/", resourceRouter);
app.use('/profile', profileRoutes);

const Listing = require('./models/listing'); // adjust if needed

app.get('/search', async (req, res) => {
  const query = req.query.query;

  try {
    const listing = await Listing.findOne({ title: { $regex: query, $options: 'i' } });

    if (listing) {
      // Redirect to listing details page
      res.redirect(`/listings/${listing._id}`);
    } else {
      // No match found — show custom page or message
      res.render('listings/searchResults', { query, notFound: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong.');
  }
});

// Semester selection page
app.get("/semester", async (req, res, next) => {
  try {
    res.render("listings/sem");
  } catch (error) {
    next(error);
  }
});

// Examination selection page
app.get("/exam/:semesterId", async (req, res, next) => {
  try {
    const { semesterId } = req.params;
    res.render("listings/exam", { semesterId });
  } catch (error) {
    next(error);
  }
});

// Examination resource page
app.get("/examinations/:semesterId/:testType", async (req, res, next) => {
  try {
    const { semesterId, testType } = req.params;
    console.log(`Requested Exam Page: Semester ${semesterId}, TestType ${testType}`);

    const resources = await Resource.find({ semesterId, testType });
    res.render("listings/examination", { semesterId, testType, resources });
  } catch (error) {
    next(error);
  }
});

// Upload Resource File
app.post("/api/resource/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("File upload request received:", req.body, req.file);

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { filename, testType, semesterId } = req.body;

    if (!filename || !testType || !semesterId) {
      return res.status(400).json({ error: "Filename, testType, and semesterId are required" });
    }

    const resource = new Resource({ url: req.file.path, filename, testType, semesterId });
    await resource.save();
    console.log("File saved in DB:", resource);

    res.status(200).json({ fileUrl: req.file.path, filename, testType, semesterId });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Fetch Files
app.get("/api/resource/:semesterId/:testType", async (req, res, next) => {
  try {
    const { semesterId, testType } = req.params;
    console.log(`Fetching files for Semester: ${semesterId}, TestType: ${testType}`);

    const resources = await Resource.find({ semesterId, testType });

    if (!resources.length) return res.status(404).json({ message: "No files found" });

    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// Catch-all 404 Errors
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message, stack: err.stack });
});

// Start Server
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
