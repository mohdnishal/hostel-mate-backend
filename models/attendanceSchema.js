const mongoose = require('mongoose');
const { Schema } = mongoose;
const attendanceSchema=new Schema(
    {
        Name:{
            type:String
        },
        Date:{ 
            type: Date
        },
        present: {
            type: Boolean
        }
    }
)
module.exports=mongoose.model('attendance',attendanceSchema)