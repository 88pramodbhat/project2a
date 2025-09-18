const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    description: String,

    image: {
        filename: String,
        url: {
            type: String,
            set: (v) => v === " " ? "https://www.bing.com/images/search?view=detailV2&ccid=SFePjxiV&id=8957E375287CD2A89F52BAF5CC3E7B85ED760508&thid=OIP.SFePjxiVA220cC8hFaLx7QHaE5&mediaurl=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F556416%2Fpexels-photo-556416.jpeg%3Fcs%3Dsrgb%26dl%3Dlandscape-mountains-nature-556416.jpg%26fm%3Djpg&exph=3251&expw=4920&q=images&simid=608029647887010175&FORM=IRPRST&ck=E37B52BE711C3258856BD02F11A631FF&selectedIndex=2&itb=0&cw=1375&ch=637&ajaxhist=0&ajaxserp=0"
                : v
        }
    },

    price: Number,
    location: String,
    country: String,

    reviews:[

        {
            type: Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
owner:{

    type: Schema.Types.ObjectId,
    ref:"User"
}



});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
