const Supply = require("../models/supply")
const Review = require("../models/review")

module.exports.createReview = async (req, res) => {
    const supply = await Supply.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    supply.reviews.push(review)
    await review.save()
    await supply.save()
    req.flash("success", "Successfully created a review!")
    res.redirect(`/supply/${supply._id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params
    await Supply.findByIdAndUpdate(id, { $pull: reviewId })
    await Review.findByIdAndDelete(reviewId)
    req.flash("success", "Successfully deleted review!")
    res.redirect(`/supply/${id}`)
}