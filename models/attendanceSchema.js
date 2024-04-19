const mongoose = require('mongoose');
const { Schema } = mongoose; 
const attendanceSchema=new Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
             required: true
          },
          date:{ 
            type: String,
            required:true
        },
        present: {
            type: Boolean
        }
    }
)
module.exports=mongoose.model('attendance',attendanceSchema)