const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}
module.exports.signup = async(req, res) => {
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome to UniSolve-Hub!");
            res.redirect("/listings");
        });
        
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
   
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs")
}

module.exports.login = async(req, res) => {
    req.flash("success","Welcome back to UniSoolve-Hub!")
    let redirectUrl = res.locals.redirectUrl || "/listings";
    return res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err){
           return next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/listings");
    })
}

module.exports.renderProfilePage = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      res.render('listings/profile', { user });
    } catch (err) {
      console.error('Error loading profile:', err);
      res.redirect('/');
    }
  };
  
  module.exports.updateProfilePhoto = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (req.file) {
        user.profileImage = req.file.path;
        await user.save();
      }
      res.redirect('/profile');
    } catch (err) {
      console.error('Error updating profile photo:', err);
      res.redirect('/profile');
    }
  };
  // controllers/users.js
module.exports.updateProfileDetails = async (req, res) => {
    const { fullName, mobile } = req.body;
    const updatedData = { fullName, mobile };

    if (req.file) {
        updatedData.profileImage = req.file.path;
    }

    await User.findByIdAndUpdate(req.user._id, updatedData, { new: true });
    res.redirect('/profile');
};
