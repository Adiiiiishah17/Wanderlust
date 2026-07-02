const mongoose= require("mongoose");
const initdata= require("./data.js");
const Listing=require("../models/listing.js");

main()
.then(()=>{
    console.log("database connected");
})
.catch((err)=>{
    console.log("DB not connected");
})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB= async ()=>{
    initdata.data = initdata.data.map((obj) => ({
    ...obj,
    owner: "6a416c049d272dd10f20aa0e"
}));

console.log(initdata.data[0]); // Check this

await Listing.insertMany(initdata.data);
    await Listing.insertMany(initdata.data);
    await Listing.insertMany(initdata.data);

const listing = await Listing.findOne();
console.log(listing);
    console.log("data was initialized");
}

initDB();