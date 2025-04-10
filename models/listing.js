const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String, 
    filename: String,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  resources: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    }
  ],  
  category: {
    type:String,
    enum: ["mountains", "rooms", "arctics", "farms", "deserts"]
  }
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
