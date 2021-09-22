const express = require("express")
const router = express.Router()
const catchError = require("../utils/catchError")
const passport = require("passport")
const users = require("../controllers/users")
const { redirectShow } = require("../middleware")

router.route("/signup")
    .get(users.signupForm)
    .post(catchError(users.createUser))

router.route("/login")
    .get(redirectShow, users.loginForm)
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), users.login)

router.get("/logout", users.logout)

module.exports = router