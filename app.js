if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}
// console.log(process.env.SECRET);

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const Review=require("./models/review.js");
const path=require("path");
const { count } = require("console");


const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const {storage}=require("./cloudconfig.js");
const multer = require("multer");
const upload = multer({storage});


const ejsMate=require("ejs-mate");
app.engine("ejs",ejsMate);

app.use(express.static(path.join(__dirname,"public")));

const {isLoggedIn}=require("./middleware.js");

const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const store=MongoStore.create({
    mongoUrl:process.env.MONGODB_ATLAS,
    crypto:{
       secret:process.env.SECRET
    },
    touchAfter:24*3600
})
store.on("error",()=>{
    console.log("error in MONGO SESSION STORE",err);
})
app.use(session({
      secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    store
}))

app.use(flash());


const passport = require("passport");
const localstrategy = require("passport-local");
const User= require("./models/user.js");

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.currUser=req.user;
    next();
})

app.get("/demouser", async (req,res)=>{
    try{
         let fakeuser= new User({
        email: "student@aso",
        username:"aditya jiiiii"
    })

    let registeruser= await User.register(fakeuser,"ashah#8406");
    res.send(registeruser);
    }
    catch(err){
        console.log(err);
        res.send(err.message);
    }
})

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));

const {reviewSchema}= require("./schema.js");

const methodoverride= require("method-override");
app.use(methodoverride("_method"));
app.listen(8080,()=>{
 console.log("server is listening");
})

app.get("/",(req,res)=>{
    res.send("Hi! I am root");
})


const wrapAsync = (fn) => {
    return function(req, res, next) {
        fn(req, res, next).catch(next);
    };
};

const ExpressError=require("./error.js");
const user = require("./models/user.js");
const { optional } = require("joi");

main()
.then(()=>{
    console.log("database connected");
})
.catch((err)=>{
    console.log("DB not connected");
    console.log(err);
})

async function main() {
    await mongoose.connect(process.env.MONGODB_ATLAS);
}

// app.get("/testlisting",async (req,res)=>{
//     let sampleListing=new Listing({
//         title:"My new Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calungute,Goa",
//         country:"India"
//     })

//     await sampleListing.save()
     

//      res.send("successful testing");
// })

//index route ------------------->>>>>>>>>>>>>>>>>>>>>>>>>

app.get("/listings",isLoggedIn,async (req,res)=>{
   const listings= await Listing.find({});
   res.render("./listings/index.ejs",{listings});
})


// add new

app.get("/listings/new",isLoggedIn,(req,res)=>{
    res.cookie("name","aditya");
        res.render("./listings/new.ejs");
})

// show route-------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>
app.get("/listings/:id", async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    res.render("./listings/show.ejs", { listing });
});

// create route

app.post("/listings",isLoggedIn,upload.single("image"), async (req,res)=>{
    // let {title,description,image,price,country,location}= req.body;
    // // let newlisting= new Listing({
    // //     title:title,
    // //     description:description,
    // //     location:location,
    // //     price:price,
    // //     country:country,
    // //     image:image
    // })
    let url = req.file.path;
    let filename=req.file.filename;
    // console.log(url," .........",filename);
     let newlisting= new Listing(req.body);
     newlisting.owner= req.user._id;
     newlisting.image={url,filename};
    await newlisting.save();
    res.redirect("/listings");
})



// app.post("/listings",upload.single("image"),(req,res)=>{
//     console.log(req.file);
//     console.log(req.body);
//     res.send(req.file);
// })

// edit route

app.get("/listings/:id/edit",isLoggedIn,async (req,res)=>{
    let {id}=req.params;
    let list =await Listing.findById(id);
    res.render("./listings/edit.ejs",{list});
})

// delete route

app.delete("/listings/:id",isLoggedIn,async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})


const validatereview= (req,res,next)=>{
      console.log(req.body);   // <-- Add this
    let {error}= reviewSchema.validate(req.body);
    if(error){
        let errMsg= error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}


// update route

app.put("/listings/:id",isLoggedIn,upload.single("image"),async (req,res)=>{
  let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,req.body);
    if(typeof req.file!=="undefined"){
  let url =req.file.path;
  let filename=req.file.filename;
  listing.image={url,filename};
  await listing.save();
  res.redirect("/listings");
    }

})



app.get("/admin",(req,res)=>{
    throw new ExpressError(401,"this route is not found");
})

app.use((err,req,res,next)=>{
    let { statusCode=500 , mssg ="error hai reeeeeeee"}=err;
    res.status(statusCode).send(mssg);
})


// reviews



app.post("/listings/:id/reviews",validatereview,wrapAsync(async (req,res)=>{
  let listing = await Listing.findById(req.params.id);
  let newreview = new Review(req.body.review);
  listing.reviews.push(newreview);
  await newreview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
}))


app.delete("/listings/:id/reviews/:reviewId",async (req,res)=>{
    let {id,reviewId}= req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
})




// practicing express-session


app.get("/session",(req,res)=>{
    req.session.name= "aditya",
    req.session.college= "nitp"
    res.send("session created");
})

app.get("/sessionprofile",(req,res)=>{
    console.log(req.session.name);
    console.log(req.session.college);
    res.send("done bhai reeeeeeeee");
})

app.get("/signup",(req,res)=>{
res.render("users/signup.ejs");
})

app.post("/signup", async (req,res,next)=>{
    let {username,email,password}= req.body;
    let newuser=new User({email,username});
   let registeruser= await User.register(newuser,password);
   console.log(registeruser);
   req.login(registeruser,(err)=>{
    if(err){
        return next(err)
    }
      req.flash("success","user was registered");
    res.redirect("/listings");
   })
})

app.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})

app.post("/login",passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),async (req,res)=>{
// res.send("Welcome to Wanderlust ! U r logged in");
res.redirect("/listings");
})

app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
              return next(err);
        }
    })
    req.flash("success","you r logged out");
    res.redirect("/listings");
})
