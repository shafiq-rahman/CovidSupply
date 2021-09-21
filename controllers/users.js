const User = require("../models/user")

module.exports.signupForm = (req, res) => {
    res.render("users/signup")
}

module.exports.createUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ username, email })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, (err) => {
            if (err) next(err)
            req.flash("success", "Welcome to COVID Supply")
            res.redirect("/supply")
        })
    } catch (err) {
        req.flash("error", err.message)
        res.redirect("/signup")
    }
}

module.exports.loginForm = (req, res) => {
    res.render("users/login")
}

module.exports.login = (req, res) => {
    const redirectURL = req.session.returnTo || "/supply"
    req.flash("success", "Welcome back!")
    delete req.session.returnTo
    res.redirect(redirectURL)
}

module.exports.logout = (req, res) => {
    req.logOut()
    req.flash("success", "Goodbye!")
    res.redirect("/supply")
}