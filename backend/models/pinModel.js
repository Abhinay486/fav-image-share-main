import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    pin : {
        type : String,
        required : true,
    },
    owner:{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "User"
    },
    image:{
        id : String,
        url : String,
    },
    tags: {
    type: [String], // ✅ New field to store hashtag strings
    default: [],
  },
    comments:[{
        user : {
          type : String,
        required : true,
        },
        name : {
            type : String,
        required : true,
        },
        comment : {
            type : String,
        required : true,

        }
    }]
},
{
    timestamps : true,
});

export const Pin = mongoose.model("Pin", schema);