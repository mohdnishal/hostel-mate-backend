const express = require('express');
const attdce=require('../models/attendanceSchema');
const Alloted=require('../models/AllotedSchema')
const router = express.Router();

router.get('/attendance', async (req, res) => {
    try {
      const students = await Alloted.find();
      res.json(students);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  router.post('/attendance', async (req, res) => {
    const { date, studentsPresent } = req.body;
  
    try {
        // Find or create attendance record for the given date
        let attendanceRecord = await attdce.findOne({ date });
        if (!attendanceRecord) {
            attendanceRecord = new attdce({ date, studentsPresent });
        } else {
            // Merge studentsPresent array with existing record
            attendanceRecord.studentsPresent = [...new Set([...attendanceRecord.studentsPresent, ...studentsPresent])];
        }
  
        // Update absence streaks for each student
        for (const studentId of studentsPresent) {
            let student = await Alloted.findById(studentId);
            if (student) {
                // Initialize absenceStreaks as a Map if it's not already
                if (!student.absenceStreaks) {
                    student.absenceStreaks = new Map();
                }
  
                // Increment absence streak for this student
                const currentStreak = student.absenceStreaks.get(date) || 0;
                student.absenceStreaks.set(date, currentStreak + 1);
                await student.save();
            }
        }
  
        // Save the attendance record
        await attendanceRecord.save();
  
        res.status(200).json({ message: 'Attendance saved successfully', attendanceRecord });
    } catch (error) {
        console.error('Error saving attendance:', error);
        res.status(500).json({ error: 'Failed to save attendance' });
    }
  });



module.exports = router;