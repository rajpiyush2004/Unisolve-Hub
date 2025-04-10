const express = require('express');
const upload = require('../upload'); // Multer upload setup
const router = express.Router();
const Resource = require('../models/resource'); // Your MongoDB Model

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { filename, semesterId, testType } = req.body;
        const fileUrl = req.file.path; // Get file path (Cloudinary / local)

        // Ensure required fields are provided
        if (!filename || !semesterId || !testType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Save file details to MongoDB
        const newResource = new Resource({
            filename,
            url: fileUrl,
            semesterId,
            testType
        });

        await newResource.save();

        res.status(200).json({ message: "File uploaded successfully", fileUrl });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "File upload failed" });
    }
});

router.get('/trending', async (req, res) => {
    try {
      const branch = req.query.branch;
      let filter = { isTrending: true };
  
      if (branch) {
        filter.branch = branch;
      }
  
      const trendingResources = await Resource.find(filter).limit(20);
      res.render('listings/trending', { trendingResources, branch });
    } catch (error) {
      console.error("Trending error:", error);
      res.status(500).send("Something went wrong.");
    }
  });
  module.exports = router;
  