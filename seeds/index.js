const mongoose = require("mongoose")
const Supply = require("../models/supply")
const { descriptors, category} = require("./seedHelpers")
const cities = require("./cities")

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/covid-aid"

mongoose.connect(dbUrl , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
    .then(() => {
        console.log("MONGODB CONNECTION ON")
    })
    .catch(err => {
        console.log("FAILED TO CONNECT MONGODB")
        console.log(err)
    })

const Sample = array => array[Math.floor(Math.random() * array.length)]
const randomCategory = (obj) => {
    const keys = Object.keys(obj)
    return obj[keys[Math.floor(Math.random() * keys.length)]]

}

const seedDB = async () => {
    await Supply.deleteMany({})
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const sampleCategory = Sample(category)
        const store = new Supply({
            title: `${Sample(descriptors)} ${Object.keys(sampleCategory)}`,
            geometry: {
                type: 'Point',
                coordinates: [  cities[random1000].longitude,
                                cities[random1000].latitude]
                },
            location: `${cities[random1000].city} ${cities[random1000].state}`,
            images: randomCategory(sampleCategory),
            description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci explicabo laudantium, et quidem ab dignissimos, veritatis maiores possimus sed quasi minima repudiandae ea, dolorem animi itaque molestiae perferendis perspiciatis optio.",
            owner: "613cb00aa6583a1c64a0d7fa",
            category: `${Object.keys(sampleCategory)}`
        })
        await store.save()
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close()
    })