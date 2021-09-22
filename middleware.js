const Supply = require("./models/supply")
const Review = require("./models/review")
const AppError = require("./utils/AppError") 
const catchError = require("./utils/catchError")
const { supplySchema, reviewSchema } = require("./schemas")


const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash("error", "You need to be signed in!")
        return res.redirect("/login")
    }
    next()
}

const validateSchema = (req, res, next) => {
    const { error } = supplySchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new AppError(400, msg)
    } else {
        next()
    }
}
const isOwner = catchError (async (req, res, next) => {
    const { id } = req.params
    const store = await Supply.findById(id)
    if (!store.owner.equals(req.user._id)) {
        req.flash("error", "You are not authorized!")
        return res.redirect(`/supply/${id}`)
    }
    next()
})

const isReviewAuthor = catchError(async (req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not authorized!")
        return res.redirect(`/supply/${id}`)
    }
    next()
})


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new AppError(400, msg)
    } else {
        next()
    }
}

const redirectShow = (req, res, next) => {
    const { id } = req.query
    if (id) {
        req.session.returnTo = `/supply/${id}`
    }
    next()
}

module.exports.isLoggedIn = isLoggedIn
module.exports.validateSchema = validateSchema
module.exports.isOwner = isOwner
module.exports.isReviewAuthor = isReviewAuthor
module.exports.validateReview = validateReview
module.exports.redirectShow = redirectShow