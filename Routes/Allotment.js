const express = require('express');
const nodemailer = require('nodemailer');
const dotenv=require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/UserSchema');
const Room = require('../models/Room'); 
const Alloted = require('../models/AllotedSchema'); 
const router = express.Router();
dotenv.config()

router.post('/allotment', async (req, res) => {
  try {
    const { studentId } = req.body;

    // Find the student by ID in the User schema
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Find an available room
    const availableRoom = await Room.findOne({ availability: true, capacity: { $gt: 0 } });
    if (!availableRoom) {
      return res.status(400).json({ error: 'No available rooms' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(student.PhoneNo, salt);

    // Create a new document in the Alloted schema
    const allottedStudent = new Alloted({
      Name: student.Name,
      AdmNo: student.AdmNo,
      PhoneNo: student.PhoneNo,
      Email:student.Email,
      password: hash,
      Degree: student.Degree,
      YearOfStudy: student.YearOfStudy,
      Branch: student.Branch,
      PAddress1: student.PAddress1,
      PAddress2: student.PAddress2,
      PPincode: student.PPincode,
      PDistrict: student.PDistrict,
      PState: student.PState,
      PCountry: student.PCountry,
      Room_No: availableRoom.Room_No,
      GName: student.GName,
      GPhoneNo: student.GPhoneNo,
      Relation: student.Relation
    });

    // Save the allotted student to the database
    await allottedStudent.save();

    // Update student's room number in the User schema
    student.roomNo = availableRoom.Room_No;
    await student.save();

    const userId = allottedStudent._id;
    // Update room details
    availableRoom.capacity--; // Decrement room capacity
    availableRoom.copystudents.push(userId); // Add student to the room's list of students
    if (availableRoom.capacity === 0) {
      availableRoom.availability = false; 
    }
    await availableRoom.save();
    await User.deleteOne({ _id: studentId });

    //Nodemailer 
    let transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.User,
        pass: process.env.Pass
      }
    });

    // Email
    let mailOptions = {
      from: 'nishalutd@gmail.com',
      to: student.Email,
      subject: 'Hostel Admission Confirmation',
      text: `Dear ${student.Name},\n\nYou have been successfully admitted to the RIT Ladies hostel.\nYour room number is ${availableRoom.Room_No}.\n\nRegards,\nHostel Management`
    };

    // Snd email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error.message);
        return res.status(500).json({ error: 'Error sending email.' });
      }
      return res.status(200).json({ message: 'Room allotted successfully. Email sent.', roomNo: availableRoom.Room_No });
    });

  } catch (error) {
    console.error('Error allotting room to student:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
router.get("/getfiles",async(req,res)=>{
    try{
      User.find({}).then((data)=>{res.send({status:"ok",data:data});});
    }
    catch(error){}
  })
  
  
  router.get('/fetch', async (req, res) => {
    try {
      const users = await User.find();
      const availableRoomsCount = await Room.countDocuments({ availability: true });
      res.json( users);
      // res.json( availableRoomsCount );
     
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      console.error(error);
    }
  });

module.exports = router;
