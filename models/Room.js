const mongoose = require('mongoose');
const { Schema } = mongoose;

const RoomSchema = new Schema({
    Room_No: {
        type: Number
    },
    capacity: {
        type: Number
    },
    availability: {
        type: Boolean,
        default: true // Set default availability to true
    },
    copystudents: [{ type: Schema.Types.ObjectId, ref: 'Alloted' }]
});
//
module.exports = mongoose.model('room', RoomSchema);