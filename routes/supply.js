const { storage } = require("../cloudinary")
const express = require("express")
const router = express.Router()
const catchError = require("../utils/catchError")
const { isLoggedIn,isOwner, validateSchema } = require("../middleware")
const supply = require("../controllers/supply")
const multer = require("multer")
const upload = multer({ storage })


router.route("/")
    .get(catchError(supply.index))
    .post(isLoggedIn, upload.array("images"), validateSchema, catchError(supply.createSupply))

router.get("/new", isLoggedIn, supply.newForm)

router.route("/:id")
    .get(catchError(supply.showSupply))
    .put(isLoggedIn, isOwner, upload.array("images"), validateSchema, catchError(supply.updateSupply))
    .delete(isLoggedIn, isOwner, catchError(supply.deleteSupply))

router.get("/:id/edit", isLoggedIn, isOwner, catchError(supply.editForm))

 

module.exports = router