const express = require("express");
const User = require("../models/User");
const passport = require("passport");
const multer = require("multer");
const cloudinary = require("cloudinary");
const router = express.Router();

/* Multer setup */
const storage = multer.diskStorage({
    filename: (req, file, callback) => {
        callback(null, Date.now() + file.originalname);
    }
});

const imageFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
        return callback(new Error("Only image files are allowed!"), false);
    }
    callback(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter });

//미들웨어
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to logged in");
    res.redirect("/user/login");
};

//라우터

/* User Routers */
router.post("/user/register", upload.single("image"), (req, res) => {
    if (
        req.body.username &&
        req.body.firstname &&
        req.body.lastname &&
        req.body.password
    ) {
        let newUser = new User({
            username: req.body.username,
            firstName: req.body.firstname,
            lastName: req.body.lastname
    });
    if (req.file) {
        cloudinary.uploader.upload(req.file.path, result => {
        newUser.profile = result.secure_url;
        return createUser(newUser, req.body.password, req, res);
        });
    } else {
        newUser.profile = process.env.DEFAULT_PROFILE_PIC;
        return createUser(newUser, req.body.password, req, res);
    }
    }
});

function createUser(newUser, password, req, res) {
    User.register(newUser, password, (err, user) => {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/");
        } else {
            passport.authenticate("local")(req, res, function () {
            console.log(req.user);
            req.flash(
                "success",
                "Success! You are registered and logged in!"
            );
            res.redirect("/");
        });
    }
    });
}

//로그인
router.get("/user/login", (req, res) => {
res.render("users/login");
});

router.post(
    "/user/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/user/login"
    }),
    (req, res) => { }
);

// All users
router.get("/user/all", isLoggedIn, (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
        console.log(err);
        req.flash(
            "error",
            "There has been a problem getting all users info."
        );
        res.redirect("/");
    } else {
        res.render("users/users", { users: users });
        }
    });
});

//로그아웃
router.get("/user/logout", (req, res) => {
    req.logout();
    res.redirect("back");
});