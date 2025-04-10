const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: ''
      },
      fullName: String,
      email: { type: String, unique: true },

});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);