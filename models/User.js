const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

let UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    userID: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    workspaces: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace'
    }],
    createdAt: {
        type: Date,
        default: Date.now
      }
})

UserSchema.plugin(passportLocalMongoose);
let User = mongoose.model("User", UserSchema);
module.exports = User;