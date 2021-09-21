const express = require("express")
const router = express.Router({ mergeParams: true})
const catchError = require("../utils/catchError")
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware")
const reviews = require("../controllers/reviews")

router.post("/", isLoggedIn, validateReview, catchError(reviews.createReview))

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchError(reviews.deleteReview))

module.exports = router