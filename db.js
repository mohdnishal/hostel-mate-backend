const mongoose=require('mongoose');
const dotenv=require('dotenv');
dotenv.config()
const URL=process.env.mongoURL;
const mongoDB = async () => {
    try {
      await mongoose.connect(URL);
      

      console.log("Connected to MongoDB");
    }
    catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
      }
    };
  module.exports=mongoDB;