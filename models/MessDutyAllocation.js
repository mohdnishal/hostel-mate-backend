const mongoose = require('mongoose');
const { Schema } = mongoose;
const MessDutySchema = new mongoose.Schema({
  roomNo: {
    type: Number,
    // required: true
  },
  studentName: {
    type: String,
    // required: true
  },
  fromDate: {
    type: String,
    // required: true
  },
  toDate: {
    type: String,
    // required: true
  }
});

module.exports = mongoose.model('messduties', MessDutySchema);
