const mongoose = require('mongoose');
const { Schema } = mongoose;
const MessBillSchema = new mongoose.Schema({
  Date: {
    type: String,
    // required: true
  },
  NumberofUser:{
    type:Number,
  },
  TotalEstablishmentcharge: {
    type: Number,
    // required: true
  },
  TotalFoodCharge: {
    type: Number,
    // required: true
  },
  Totalnoofattendance:{
    type:Number
  },
  TotalExpense:{
    type:Number,
  },
  esscharge:{
    type:Number
  },
  FoodPerDay:{
    type:Number
  },
  Fine:{
    type:Number
   },
  TotalAttendance:{
    type:Number
  },
  RatePerDay:{
    type:Number
  }
});

module.exports = mongoose.model('messbill', MessBillSchema);
