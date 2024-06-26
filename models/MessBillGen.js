const mongoose = require('mongoose');
const Alloted = require('./AllotedSchema');
const { Schema } = mongoose;

const MessBillGenSchema = new Schema({
  month: {
    type: String,
    required: true,
  },//
  messBills: [
    {
      student: {
        type: Schema.Types.String,
        ref: 'Alloted', // Reference to the Alloted schema
        required: true,
      },
      date: {
        type: String,
        
      },
      Room_No: {
        type: Number,
        
      },
      Name: {
        type: String,
        
      },
      AdmNo: {
        type: String,
        
      },
      yearOfStudy: {
        type: Number,
        
      },
      Amount: {
        type: Number,
        
      },
      TotalAmount: {
        type: Number,
        
      },
      Fine: {
        type: Number,
        
      },
      TotalAttendance: {
        type: Number,
        
      },
    },
  ],
});

module.exports = mongoose.model('MessBillGen', MessBillGenSchema);
