



const Listing=require("../model/listing");


module.exports.index=(async (req, res) => {
    const all_listings = await Listing.find({});
    res.render("listings/index.ejs", { all_listings });
  })