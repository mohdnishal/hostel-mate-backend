const mongoose = require('mongoose');
const { Schema } = mongoose;
const RoomSchema=new Schema(
    {
        Room_No:{
            type:String
        },
        capacity:{ 
            type: Number
        },
        availability: {
            type: Boolean
        },
        copystudents: [{ type: Schema.Types.ObjectId, ref: 'user' }]
    }
)
module.exports=mongoose.model('room',RoomSchema)