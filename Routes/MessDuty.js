const express=require('express');
const router=express.Router();
const MessDutySchema=require('./models/MessDutyAllocation');
const Alloted=require('./models/AllotedSchema')



let lastToDate = new Date(); // Initialize lastToDate to the current date
let lastAllocatedDate = new Date(); // Initialize last allocated date with the current date

const MessDuty=async (req, res) => {
    try {
      // Retrieve the last allocated date from the MessDutySchema collection
      const lastAllocation = await MessDutySchema.findOne({}, {}, { sort: { 'toDate': -1 } });
  
      if (lastAllocation) {
        // If there is a last allocated date, set lastAllocatedDate as the toDate of the last allocation
        lastAllocatedDate = new Date(lastAllocation.toDate);
        lastAllocatedDate.setDate(lastAllocatedDate.getDate() + 1); // Increment by 1 day
      }
  
      // Retrieve all rooms with their students count
      const rooms = await Alloted.aggregate([
        {
          $group: {
            _id: '$Room_No',
            students: { $push: '$_id' }, // Push student IDs into an array
            count: { $sum: 1 } // Calculate the count of students in each group
          }
        }
      ]);
  
      // Iterate over rooms and allocate mess duty for each
      for (const room of rooms) {
        const { _id: roomNo, students } = room;
  
        let remainingStudents = students; // Copy all students initially
        while (remainingStudents.length >= 2) {
          const studentGroup = remainingStudents.splice(0, 2); // Take 2 students for the group
  
          // Allocate duty for two days starting from lastAllocatedDate
          const fromDate = lastAllocatedDate.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
          const toDate = new Date(lastAllocatedDate.setDate(lastAllocatedDate.getDate() + 1)).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  
          for (const studentId of studentGroup) {
            const student = await Alloted.findById(studentId);
            if (student) {
              await MessDutySchema.create({
                roomNo: student.Room_No,
                studentName: student.Name,
                fromDate,
                toDate
              });
            }
          }
  
          // Update lastAllocatedDate for the next group
          lastAllocatedDate.setDate(lastAllocatedDate.getDate() + 1); // Add 2 days for the next group
        }
  
        // Allocate duty for remaining students in the room, if any
        if (remainingStudents.length > 0) {
          const fromDate = lastAllocatedDate.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
          const toDate = new Date(lastAllocatedDate.setDate(lastAllocatedDate.getDate() + 1)).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  
          for (const studentId of remainingStudents) {
            const student = await Alloted.findById(studentId);
            if (student) {
              await MessDutySchema.create({
                roomNo: student.Room_No,
                studentName: student.Name,
                fromDate,
                toDate
              });
            }
          }
  
          // Update lastAllocatedDate for the next group
          lastAllocatedDate.setDate(lastAllocatedDate.getDate() + 1); // Add 1 day for the next group
        }
      }
  
      // Respond with success message
      res.status(200).json({ message: 'Mess duty allocated successfully for next month' });
    } catch (error) {
      // Handle errors
      console.error('Error allocating mess duty:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  module.exports=MessDuty;