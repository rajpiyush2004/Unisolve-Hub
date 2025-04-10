const express = require('express');
const router = express.Router();
const { renderProfilePage, updateProfilePhoto } = require('../controllers/users');
const { isLoggedIn } = require('../middleware'); // Optional: Only if you're using auth
const User = require('../models/user');

const multer = require('multer');
const { storageProfile } = require('../cloudConfig'); 
const upload = multer({ storage: storageProfile });
const { updateProfileDetails } = require('../controllers/users');
// GET profile page
router.get('/', isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id); // or req.session.user if not using passport
    res.render('listings/profile', { user });
  });

// POST profile photo update
router.post('/photo', isLoggedIn, upload.single('profileImage'), updateProfilePhoto);


router.post('/update', isLoggedIn, upload.single('profileImage'), updateProfileDetails);

module.exports = router;
