import mongoose from "mongoose";

const registerSchema = new mongoose.Schema({
   name: {
    type: String,
    required: true
    },
    email:{
        type: String,
        required: true 
    },
    telNumber:{
        type: Number,
        required: true,
    },
    date:{
        type: Date,
        required: false,
        default: Date.now
    },
    favouriteBeer:{
        type: String,
        required: true
    }
})

export default mongoose.model('register', registerSchema)