const Supply = require("../models/supply")
const { category } = require("../seeds/seedHelpers")
const { cloudinary } = require("../cloudinary")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken: mapBoxToken})

module.exports.index = async (req, res) => {
    const supplies = await Supply.find({})
    res.render("supply/index", { supplies })
}

module.exports.newForm = (req, res) => {
    res.render("supply/new", { category })
}

module.exports.createSupply = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.store.location,
        limit:1
    }).send()
    const store = new Supply(req.body.store)
    store.geometry = geoData.body.features[0].geometry
    store.owner = req.user._id
    store.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    await store.save()
    req.flash("success", "Successfully created a new Supply store !")
    res.redirect(`/supply/${store._id}`)
}

module.exports.showSupply = async (req, res) => {
    const { id } = req.params
    const store = await Supply.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate("owner").populate("images")
    if (!store) {
        req.flash("error", "Cannot find that store!")
        return res.redirect("/supply")
    }
    res.render("supply/show", { store })
}

module.exports.editForm = async (req, res) => {
    const { id } = req.params
    const store = await Supply.findById(id)
    if (!store) {
        req.flash("error", "Cannot find that store!")
        return res.redirect("/supply")
    }
    res.render("supply/edit", { store, category })
}

module.exports.updateSupply = async (req, res) => {
    const { id } = req.params
    const geoData = await geocoder.forwardGeocode({
        query: req.body.store.location,
        limit: 1
    }).send()
    const store = await Supply.findByIdAndUpdate(id, { ...req.body.store })
    if (!store) {
        req.flash("error", "Cannot find that store!")
        return res.redirect("/supply")
    }
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    store.images.push(...images)
    store.geometry = geoData.body.features[0].geometry
    await store.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await store.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash("success", "Successfully updated store!")
    res.redirect(`/supply/${id}`)
}

module.exports.deleteSupply = async (req, res) => {
    const { id } = req.params
    const store = await Supply.findByIdAndDelete(id)
    if (!store) {
        req.flash("error", "Cannot find that store!")
        return res.redirect("/supply")
    }
    req.flash("success", "Successfully deleted store!")
    res.redirect("/supply")
}
