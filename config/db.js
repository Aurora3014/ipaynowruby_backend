require('dotenv').config();
const mongoose = require("mongoose");

mongoose.set('strictQuery', true);
mongoose.Promise = global.Promise;

// connect to the database
mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("db connected!");
}).catch((err)=>{
    console.log(err);
})