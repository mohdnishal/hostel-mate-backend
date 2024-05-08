const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Check if the model already exists to prevent OverwriteModelError
const MessDutyModel = mongoose.models.messduties || mongoose.model('messduties', new Schema({
  roomNo: {
    type: Number,
    // required: true
  },
  studentName:{
    type: String,
  },
  fromDate: {
    type: String,
    // required: true
  },
  toDate: {
    type: String,
    // required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Alloted' // Reference to AllotedSchema model
  }
}));

module.exports = MessDutyModel;
