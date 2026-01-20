const mongoose = require('mongoose');
require('dotenv').config()

const DB = process.env.DB_URL
mongoose.connect(DB).then(()=>{
    console.log("Database connected successfully");
}).catch((e)=>{
    console.log("Database connection failed");
})