const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
      },
      filename: {
        type: String,
        required: true
      },
      testType: {
        type: String
      },
      semesterId: {
        type: String
      },
      branch: {
         type: String, 
         required: true 
        },
        url: String,
        isTrending: {
          type: Boolean,
          default: false
        },
      uploadedAt: { 
        type: Date, 
        default: Date.now 
      }
});

const Resource = mongoose.model("Resource", resourceSchema);

module.exports = Resource;
