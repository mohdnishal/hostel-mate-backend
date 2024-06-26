const express = require('express');
const MessDutySchema=require('../models/MessDutyAllocation');
const Alloted=require('../models/AllotedSchema')
const { createToken, authMiddleware } = require('../middleware/middleWare');
const router = express.Router();

router.post('/allocate-mess-duty', async (req, res) => {
  try {
  
    let lastToDate = new Date();
    lastToDate.setDate(lastToDate.getDate() + 2);

    // Retrieve the last allocated date from the MessDutySchema collection
    const lastAllocation = await MessDutySchema.findOne({}, {}, { sort: { 'toDate': -1 } });

    if (lastAllocation) {
      // If there is a last allocated date, set lastToDate as the 
      lastToDate = new Date(lastAllocation.toDate);
      lastToDate.setDate(lastToDate.getDate() + 1);
    }

    const allStudents = await Alloted.find({});

    // Track allocated students
    const allocatedStudents = new Set();

    // Allocate duty for each student
    for (const student of allStudents) {
      if (!allocatedStudents.has(student._id)) {
        const roomStudents = allStudents.filter(s => s.Room_No === student.Room_No);

        // Allocate duty for the group
        const fromDate = lastToDate.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const toDate = new Date(lastToDate.setDate(lastToDate.getDate() + 1)).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

        for (const groupStudent of roomStudents) {
          await MessDutySchema.create({
            roomNo: groupStudent.Room_No,
            studentName: groupStudent.Name,
            fromDate,
            toDate,
            student: groupStudent._id ,
          });
          allocatedStudents.add(groupStudent._id); // Track allocated student
        }

        // Update lastToDate for the next group
        lastToDate.setDate(lastToDate.getDate() + 1); // Add 1 day for the next group
      }
    }

    
    res.status(200).json({ message: 'Mess duty allocated successfully for next month' });
  } catch (error) {
    
    console.error('Error allocating mess duty:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/delete-all-mess-duty', async (req, res) => {
  try {
    await MessDutySchema.deleteMany({});
    res.status(200).json({ message: 'All mess duty data deleted successfully' });
  } catch (error) {
    console.error('Error deleting all mess duty data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/mess-duty', async (req, res) => {
  try {
    
    const messDutyData = await MessDutySchema.find();
    res.json(messDutyData);
  } catch (error) {
    console.error('Error fetching mess duty data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// user mess duty schedule   ..........
router.get('/usermessduty', authMiddleware, async (req, res) => {
  try {
    // Fetch mess duty data for the logged-in user 
    const messDutyData = await MessDutySchema.find({ student: req.user.id }); // Assuming user ID 
    if (!messDutyData || messDutyData.length === 0) {
      return res.status(404).json({ error: 'Mess duty data not found for the logged-in user' });
    }
    res.json(messDutyData);
  } catch (error) {
    console.error('Error fetching mess duty data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;