const express = require("express");
const router = express.Router({mergeParams: true});
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema} = require("./schema.js")
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")
const session = require("express-session");
const flash = require("connect-flash");


const userRouter = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then( () => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded ({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {              //days * hrs * min * sec * milisec
        expires: Date.now() + 7 * 24 * 60 * 60 *1000,
        maxAge: 7 * 24 * 60 * 60 *1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash())


app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.send("hii, i am root");
})

// app.get("/demouser", async(req, res) => {
//     let fakeuser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     })

//     let registeredUser = await User.register(fakeuser, "helloworld");
//     res.send(registeredUser);
// })

app.use("/", userRouter);

// const validateListing = (req, res, next) => {     
//     let {error} = listingSchema.validate(req.body)                                              //also do like this
//     if(error){                          
//     let errMsg = error.details.map((el) => el.message).join(",");                               //if(error){ throw new ExpressError(400, errMsg) } 
//     throw new ExpressError(400, errMsg)                                                         //else next()
//     }
//     else{
//         next()
//     }
// }

//[ Index Route ]
app.get("/listings", wrapAsync( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//[ Add New ] => Shows only page to add new listings
app.get("/listings/new", wrapAsync( (req, res) => {
    res.render("listings/new.ejs")
}));

//[ Create Route ] => Adds New
app.post("/listings", wrapAsync(async(req, res, next ) => {
                                                                                // if(!req.body.listing){
                                                                                //     throw new ExpressError(404, "Send Valid Data for listing")
                                                                                // }
    let result = listingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400, result.error.message)
    }
    // let { title, description, image, price, country, location } = req.body
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
})
);
//we can also do like this using middleware and give to in the second last next(err) => it will call another error middleware
// app.post("/listings", async(req, res, next ) => {
//     // let { title, description, image, price, country, location } = req.body
//     try {
//         const newListing = new Listing(req.body.listing);
//         await newListing.save();
//         res.redirect("/listings");
//     } catch (err) {
//         next(err)
//     }
// })

//[ Show Route ] => Shows whatever listings you have selected
app.get("/listings/:id", wrapAsync( async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

//[ Edit Route ] => Shows only Edit Page
app.get("/listings/:id/edit", wrapAsync( async (req, res) => {
    if(!req.body.listing){
        throw new ExpressError(404, "Send Valid Data for listing")
    }
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//[ Update Route ] => Edit in Listings
app.put("/listings/:id", wrapAsync( async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect("/listings");
}));

// [ Delete Route ] => Delete Listing
app.delete("/listings/:id", wrapAsync( async (req, res) => {
    let {id} = req.params;
    const deletedList = await Listing.findByIdAndDelete(id);
    console.log(deletedList);
    res.redirect("/listings", )
}));

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found"))
})

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something Went Wrong"} = err;
    res.status(statusCode).render("Error.ejs", {message})
    // res.status(statusCode).send(message);
    
})

//Testing List
// app.get("/testinglist", async(req, res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calanguta, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log(sampleListing);
//     res.send("successfull")
// })

let port = 8080;
app.listen(port, () => {
    console.log("server is listening to port", port)
})