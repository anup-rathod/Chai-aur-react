const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default: "https://unsplash.com/photos/woman-walking-on-street-surrounded-by-buildings-iUBgeNeyVy8",
        set: (v) => 
        v==="" ?
        "https://unsplash.com/photos/woman-walking-on-street-surrounded-by-buildings-iUBgeNeyVy8"
        : v,
    },
    price: Number,
    location: String,
    country: String,
})



const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
