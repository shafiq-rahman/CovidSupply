if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config()
}

//All Dependencies
const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const ejsMate = require("ejs-mate")
const methodOverride = require("method-override")
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user")
const AppError = require("./utils/AppError")
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet")
const userRoutes = require("./routes/users")
const supplyRoutes = require("./routes/supply")
const reviewRoutes = require("./routes/reviews")
const MongoStore = require('connect-mongo');
const favicon = require("serve-favicon")
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/covid-aid"

//Mongoose Connection
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
    .then(() => {
        console.log("MONGODB CONNECTION ON")
    })
    .catch(err => {
        console.log("FAILED TO CONNECT MONGODB")
        console.log(err)
    })

//Express connection
const app = express()

app.engine("ejs", ejsMate)
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use(mongoSanitize())
app.use(helmet())
app.use(favicon(path.join(__dirname, "images/js.ico")))

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = ["https://fonts.gstatic.com"];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/javfiq/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET || "THISNEEDSTOBEASECRET"

const dbStore = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

dbStore.on("error", (e) => {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store: dbStore,
    name: 'session',
    secret,
    // secure: true,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}

app.use(session(sessionConfig))
app.use(flash())

//Setting up passport
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currentUser = req.user
    next()
})

app.use("/supply", supplyRoutes)
app.use("/supply/:id/reviews", reviewRoutes)
app.use("/", userRoutes)

app.use(express.static(path.join(__dirname, "public")))


//Setting up the server
const port = process.env.PORT || 8080

app.listen(port, () => {
    console.log(`LISTENING TO PORT ${port}`)
})

//Route handlers
app.get("/", (req, res) => {
    res.render("home")
})

app.all("*", (req, res, next) => {
    next( new AppError(404, 'Page not found!'))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err
    if (!err.message) err.message = 'OH NO! SOMETHING WENT WRONG'
    res.status(status).render("error", { err })
})