const express = require("express")
const router = express.Router()
const catchError = require("../utils/catchError")
const passport = require("passport")
const users = require("../controllers/users")

router.route("/signup")
    .get(users.signupForm)
    .post(catchError(users.createUser))

router.route("/login")
    .get(users.loginForm)
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), users.login)

router.get("/logout", users.logout)

module.exports = router