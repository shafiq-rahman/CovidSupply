const mongoose = require("mongoose")
const Review = require("./review")
const Schema = mongoose.Schema

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200")
})

const options = {toJSON: {virtuals: true}}

const SupplySchema = new Schema({
    title: String,
    description: String,
    location: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], 
            required: true
        }
    },
    description: String,
    category: {
        type: String,
        enum:['Medical','OxygenSupply','Foods','Grocery','Dairy']
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
}, options)

SupplySchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href="/supply/${this._id}"><h4>${this.title}</h4></a>
            <p>Location: ${this.location}<p>`
})

SupplySchema.post("findOneAndDelete", async function (doc) {
    await Review.deleteMany({
        _id: {
            $in: doc.reviews
        }
    })
})

const Supply = mongoose.model("Supply", SupplySchema)
module.exports = Supply