const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessBillGenSchema = new Schema({
  month: {
    type: String,
    required: true,
  },
  messBills: [
    {
      date: {
        type: String,
        // Other properties...
      },
      Room_No: {
        type: Number,
        // Other properties...
      },
      Name: {
        type: String,
        // Other properties...
      },
      AdmNo: {
        type: String,
        // Other properties...
      },
      yearOfStudy: {
        type: Number,
        // Other properties...
      },
      Amount: {
        type: Number,
        // Other properties...
      },
      TotalAmount: {
        type: Number,
        // Other properties...
      },
      Fine: {
        type: Number,
        // Other properties...
      },
      TotalAttendance: {
        type: Number,
        // Other properties...
      },
    },
  ],
});

module.exports = mongoose.model('MessBillGen', MessBillGenSchema);
