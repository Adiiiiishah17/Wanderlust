const express= require("express");

const router= express.Router();

router.get("/",async (req,res)=>{
     console.log("listing dikhai de rhi hai");
   const listings= await Listing.find({});
   res.render("./listings/index.ejs",{listings});
})


// add new

router.get("/new",(req,res)=>{
   
    res.render("./listings/new.ejs");
})

// show route-------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>
router.get("/:id", async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("./listings/show.ejs", { listing });
});

// create route

// router.post("/", async (req,res)=>{
//     // let {title,description,image,price,country,location}= req.body;
//     // // let newlisting= new Listing({
//     // //     title:title,
//     // //     description:description,
//     // //     location:location,
//     // //     price:price,
//     // //     country:country,
//     // //     image:image
//     // })

//      let newlisting= new Listing(req.body);
//     await newlisting.save();
//     newlisting.owner= req.user._id;
//     res.redirect("/listings");
// })

const multer=require("multer");
const upload= multer({dest:'uploads'});

router.post("/",upload.single("image"),(req,res)=>{
    console.log(req.file);
    console.log(req.body);
    res.send(req.file);
})


// edit route

router.get("/:id/edit",async (req,res)=>{
    let {id}=req.params;
    let list =await Listing.findById(id);
    res.render("./listings/edit.ejs",{list});
})

// delete route

router.delete("/:id",async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})

// update route

router.put("/:id",async (req,res)=>{
  let {id}=req.params;
    await Listing.findByIdAndUpdate(id,req.body);
  res.redirect("/listings");
})



module.exports= router;

