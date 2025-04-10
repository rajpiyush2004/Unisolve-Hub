const Listing = require("../models/listing");
const User = require("../models/user");

// 🏠 Home - Show all listings
module.exports.index = async (req, res, next) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  } catch (err) {
    next(err);
  }
};

// ➕ Render new listing form
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// ✅ Create new listing
module.exports.createListing = async (req, res, next) => {
  try {
    const { path: url, filename } = req.file;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};

// 🔍 Show listing details
module.exports.showListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing you requested does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
  } catch (err) {
    next(err);
  }
};

// ✏️ Render edit listing form
module.exports.renderEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing you requested does not exist!");
      return res.redirect("/listings");
    }

    const originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
  } catch (err) {
    next(err);
  }
};

// 🔄 Update listing
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    if (req.file) {
      const { path: url, filename } = req.file;
      listing.image = { url, filename };
      await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};

// ❌ Delete listing
module.exports.destroyListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
      req.flash("error", "Listing not found or already deleted.");
    } else {
      console.log("🗑️ Deleted listing:", deletedListing);
      req.flash("success", "Listing Deleted!");
    }

    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};

// 👤 Render user profile page
module.exports.renderProfilePage = (req, res) => {
  if (!req.user) return res.redirect("/login");
  res.render("listings/profile", { user: req.user });
};

// 📸 Upload profile photo and update user details
module.exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    const { fullName, mobile } = req.body;
    const user = req.user;

    if (req.file) {
      user.profileImage = req.file.path;
    }

    if (fullName?.trim()) user.fullName = fullName.trim();
    if (mobile?.trim()) user.mobile = mobile.trim();

    await user.save();

    console.log("✅ Profile updated:", {
      fullName: user.fullName,
      mobile: user.mobile,
      image: user.profileImage
    });

    req.flash("success", "Profile updated successfully!");
    res.redirect("/listings/profile");
  } catch (err) {
    console.error("❌ Profile update error:", err);
    req.flash("error", "Failed to update profile.");
    res.redirect("/listings/profile");
  }
};
