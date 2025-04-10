const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    console.log(req.path, "..", req.originalUrl);
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create a listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }
        if (!res.locals.currUser || !listing.owner || !listing.owner.equals(res.locals.currUser._id)) {
            req.flash("error", "You don't have permission to edit this listing!");
            return res.redirect(`/listings/${id}`);
        }
        res.locals.listing = listing;
        next();
    } catch (err) {
        req.flash("error", "Something went wrong!");
        res.redirect("/listings");
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        const review = await Review.findById(reviewId).populate('author');
        if (!review) {
            req.flash("error", "Review not found");
            return res.redirect(`/listings/${id}`);
        }
        if (!review.author || !review.author._id.equals(res.locals.currUser._id)) {
            req.flash("error", "You are not the author of this review");
            return res.redirect(`/listings/${id}`);
        }
        next(); 
    } catch (err) {
        req.flash("error", "Something went wrong!");
        res.redirect(`/listings/${id}`);
    }
};
