const express = require('express');
const mongoDB = require('./db');
const User = require('./models/UserSchema');
const User2 = require('./models/UserSchema2');
const attdce=require('./models/attendanceSchema');
const Alloted=require('./models/AllotedSchema')
const MessDutySchema=require('./models/MessDutyAllocation');
const MessBillSchema=require('./models/MessBillSchema');
const ComplaintSchema=require('./models/ComplaintSchema');
const MessBillGen = require('./models/MessBillGen');
const Room=require('./models/Room');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt= require('bcryptjs');
const jwt=require('jsonwebtoken');
const dotenv=require('dotenv');
const cookieParser = require('cookie-parser');
dotenv.config()
const { createToken, authMiddleware } = require('./middleware/middleWare');
const router = express.Router();

const app = express();
const port = 5000;
app.use(cookieParser())

// Connect to MongoDB
mongoDB();


app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000'
  })
);


app.use(express.json());

// //-------- Multer configuration for file uploads------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './files';
    // Create the destination directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  }
});

const upload = multer({ storage: storage });
// 

//-----------------/multer-------------------------------------
//-------------- Route to handle user registration----------------
app.post('/register', upload.fields([{ name: 'IncomeCertificate', maxCount: 1 }, { name: 'Adhar', maxCount: 1 }]), async (req, res) => {
  console.log(req.file);
  const {
    Name, PhoneNo, EmergencyPhoneNo, Gender, Degree, AdmNo, YearOfStudy, Branch, PAddress1,
    PAddress2, PPincode, PDistrict, PState, PCountry, RAddressLine1, RAddress2, RPincode, RDistrict, RState, RCountry,
    Income, GName, GPhoneNo, Relation, GAddress1, GAddress2, GPincode, GDistrict, GState, GCountry,Priority
  } = req.body;

  try {
    const StudentInfo = await User.create({
      Name, PhoneNo, EmergencyPhoneNo, Gender, Degree, AdmNo, YearOfStudy, Branch, PAddress1,
      PAddress2, PPincode, PDistrict, PState, PCountry, Adhar: req.files['Adhar'][0].filename, RAddressLine1, RAddress2, RPincode, RDistrict, RState, RCountry,
      Income, IncomeCertificate: req.files['IncomeCertificate'][0].filename, GName, GPhoneNo, Relation, GAddress1, GAddress2, GPincode, GDistrict, GState, GCountry,Priority
    });
    res.json(StudentInfo);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
    console.error(error);
  }
});
// Route to copy user registration data to another schema
app.post('/copyregister', async (req, res) => {
  try {
    
    const { Date, Name, PhoneNo, EmergencyPhoneNo, Gender, Degree, AdmNo, YearOfStudy, Branch, PAddress1, PAddress2, PPincode, PDistrict, PState, PCountry, RAddressLine1, RAddress2, RPincode, RDistrict, RState, RCountry, Income, GName, GPhoneNo, Relation, GAddress1, GAddress2, GPincode, GDistrict, GState, GCountry, Priority } = req.body;

    // Ensure that IncomeCertificate and Adhar are provided
    
    const newData = await User2.create({
      Date, Name, PhoneNo, EmergencyPhoneNo, Gender, Degree, AdmNo, YearOfStudy, Branch, PAddress1, PAddress2, PPincode, PDistrict, PState, PCountry,
      RAddressLine1, RAddress2, RPincode, RDistrict, RState, RCountry, Income, GName, GPhoneNo, Relation, GAddress1, GAddress2, GPincode, GDistrict, GState, GCountry, Priority,

    });

    res.status(200).json({ message: 'Data copied to another schema successfully' });
  } catch (error) {
    console.error('Error copying data to another schema:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//---------------/userReg-------------------------------------
app.use("/files",express.static("files"));
app.get("/getfiles",async(req,res)=>{
  try{
    User.find({}).then((data)=>{res.send({status:"ok",data:data});});
  }
  catch(error){}
})


// Route to fetch user data
app.get('/fetch', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
    console.error(error);
  }
});
// ---------------attendane---------------

app.get('/attendance', async (req, res) => {
  try {
    const students = await Alloted.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.post('/attendance', async (req, res) => {
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

// app.post('/attendance', async (req, res) => {
//   try {
//     const { date, studentsPresent } = req.body;

//     // Check if the date is empty
//     if (!date) {
//       return res.status(400).json({ message: 'Date is required' });
//     }

//     // Create new attendance record
//     const attendance = new attdce({
//       date,
//       studentsPresent,
//     });

//     // Save the attendance record to the database
//     const savedAttendance = await attendance.save();

//     res.status(201).json({ message: 'Attendance saved successfully', attendance: savedAttendance });
//   } catch (error) {
//     console.error('Error saving attendance:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });
//

// ----------------user------------------------------

// Route to handle allotting a room to a student
app.post('/allot', async (req, res) => {
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
    const salt=await bcrypt.genSalt(10)
    const hash=await bcrypt.hash(student.PhoneNo,salt)
    


    // Create a new document in the Alloted schema
    const allottedStudent = new Alloted({
      Name: student.Name,
      AdmNo:student.AdmNo,
      PhoneNo:student.PhoneNo,
      password:hash,
      Degree:student.Degree,
      AdmNo:student.AdmNo,
      YearOfStudy:student.YearOfStudy,
      Branch:student.Branch,
      PAddress1:student.PAddress1,
      PAddress2:student.PAddress2,
      PPincode:student.PPincode,
      PDistrict:student.PDistrict,
      PState:student.PState,
      PCountry:student.PCountry,
      Room_No: availableRoom.Room_No,
      GName:student.GName,
      GPhoneNo:student.GPhoneNo,
      Relation:student.Relation 
      // Add other fields from the user and room schemas as needed
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
      availableRoom.availability = false; // Set availability to false if room is full
    }
    await availableRoom.save();
    //
    await User.deleteOne({ _id: studentId });

    return res.status(200).json({ message: 'Room allotted successfully', roomNo: availableRoom.Room_No });
  } catch (error) {
    console.error('Error allotting room to student:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// const createToken=(id)=>{
//   return jwt.sign({id},process.env.SECRET,{expiresIn:'2d'})
// }
app.get('/allotted-details', async (req, res) => {
  try {
    // Fetch allotted details from the database and sort them by room number in ascending order
    const allottedDetails = await Alloted.find().sort({ Room_No: 1 });

    // Custom sorting function to handle room numbers starting from 100
    const sortedAllottedDetails = allottedDetails.sort((a, b) => {
      const roomNoA = parseInt(a.Room_No);
      const roomNoB = parseInt(b.Room_No);
      return roomNoA - roomNoB;
    });

    res.json(sortedAllottedDetails);
  } catch (error) {
    console.error('Error fetching allotted details:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/available-rooms', async (req, res) => {
  try {
    // Find distinct room numbers from the Alloted schema where mess duty is not allocated
    const availableRooms = await Alloted.distinct('Room_No', { messDutyAllocated: false });
    res.status(200).json({ availableRooms });
  } catch (error) {
    console.error('Error fetching available rooms:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/allocate-mess-duty', async (req, res) => {
  try {
    // Initialize lastToDate to the current date plus 10 days
    let lastToDate = new Date();
    lastToDate.setDate(lastToDate.getDate() + 10);

    // Retrieve the last allocated date from the MessDutySchema collection
    const lastAllocation = await MessDutySchema.findOne({}, {}, { sort: { 'toDate': -1 } });

    if (lastAllocation) {
      // If there is a last allocated date, set lastToDate as the toDate of the last allocation plus 10 days
      lastToDate = new Date(lastAllocation.toDate);
      lastToDate.setDate(lastToDate.getDate() + 10);
    }

    // Retrieve all students
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
            toDate
          });
          allocatedStudents.add(groupStudent._id); // Track allocated student
        }

        // Update lastToDate for the next group
        lastToDate.setDate(lastToDate.getDate() + 1); // Add 1 day for the next group
      }
    }

    // Respond with success message
    res.status(200).json({ message: 'Mess duty allocated successfully for next month' });
  } catch (error) {
    // Handle errors
    console.error('Error allocating mess duty:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const mongoose = require('mongoose');

const AllotedSchema = require('./models/AllotedSchema');


const { Types } = mongoose;

// Route to vacate a room and delete user data
app.post('/vacate-room', async (req, res) => {
  try {
    const { userId, roomNo } = req.body; // Extract userId and roomNo from req.body
    console.log(roomNo);
    // Delete the user from Alloted schema
    const deletedUser = await Alloted.findByIdAndDelete(userId);
    if (!deletedUser) {
      console.error('User not found or deletion failed');
      return res.status(404).json({ error: 'User not found or deletion failed' });
    }

    // Find the room by roomNo and update it
    const updatedRoom = await Room.findOneAndUpdate(
      { Room_No: roomNo },
      {
        $pull: { copystudents: userId }, // Remove userId from copystudents array
        $inc: { capacity: 1 }, // Increment capacity by 1
        $set: { availability: true } // Set availability to true
      },
      { new: true } // Return the updated room document
    );

    if (!updatedRoom) {
      console.error('Room not found or update failed');
      return res.status(404).json({ error: 'Room not found or update failed' });
    }

    return res.status(200).json({ message: 'Room vacated successfully' });
  } catch (error) {
    console.error('Error vacating room:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/complaint',async(req,res)=>
{
  try {
    const{name,complaint}=req.body
 //g name=Alloted.Name;
  const comp=new ComplaintSchema({
    Name:name,
    Complaint:complaint
  })
  await comp.save()
  res.status(200).json({ message: 'Data copied to another schema successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
  
})

app.get('/viewcomplaint',async(req,res)=>{
  try {
    const complaint=await ComplaintSchema.findOne();
  res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });

  }
  

})
// Route to fetch all student details
// app.get('/students',authMiddleware, async (req, res) => {
//   try {
//     const students = await Alloted.find();
//     res.status(200).json(students);
//   } catch (error) {
//     console.error('Error fetching student details:', error.message);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
app.get('/profile',async(req,res)=>{
  const{token}=req.cookies;
  if(token)
  {
    jwt.verify(token,process.env.SECRET,{},(err,user)=>{
      if(err) throw err;
      res.json(user)
    })
  }else{
    res.json(null)
  }
})
// //



app.post('/login', async (req, res) => {
  try {
    const { AdmNo, password } = req.body;
    const user = await Alloted.login(AdmNo, password);
    const token = createToken(user._id);
    res.cookie('token', token, { httpOnly: true }); // Set token in cookie with HttpOnly flag
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});



// Add this route to your Express.js backend
app.delete('/delete-all-mess-duty', async (req, res) => {
  try {
    await MessDutySchema.deleteMany({});
    res.status(200).json({ message: 'All mess duty data deleted successfully' });
  } catch (error) {
    console.error('Error deleting all mess duty data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to fetch mess duty schedule
app.get('/mess-duty', async (req, res) => {
  try {
    // Fetch mess duty data from the database
    const messDutyData = await MessDutySchema.find();
    res.json(messDutyData);
  } catch (error) {
    console.error('Error fetching mess duty data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/counts', async (req, res) => {
  try {
    const result = await attdce.aggregate([
      {
        $unwind: '$studentsPresent' // Unwind the studentsPresent array
      },
      {
        $group: {
          _id: '$studentsPresent', // Group by student ID
          count: { $sum: 1 } // Count the occurrences
        }
      },
      {
        $lookup: {
          from: 'users', // Look up data from the 'users' collection
          localField: '_id',
          foreignField: '_id',
          as: 'studentData'
        }
      },
      {
        $unwind: '$studentData' // Unwind the studentData array
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          studentId: '$_id',
          studentName: '$studentData.Name',
          count: 1 // Include the count field
        }
      }
    ]);

    const studentsPresentCounts = {};
    result.forEach(item => {
      studentsPresentCounts[item.studentName] = item.count;
    });

    res.json(studentsPresentCounts);
  } catch (error) {
    console.error('Error getting attendance count for students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/totalattendance', async (req, res) => {
  try {
    const { month, year } = req.query;
    const result = await attdce.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $year: { $dateFromString: { dateString: '$date' } } }, parseInt(year)] },
              { $eq: [{ $month: { $dateFromString: { dateString: '$date' } } }, parseInt(month)] }
            ]
          }
        }
      },
      {
        $project: {
          date: 1,
          studentCount: { $size: '$studentsPresent' }
        }
      },
      {
        $group: {
          _id: '$date',
          totalStudentsPresent: { $sum: '$studentCount' }
        }
      },
      {
        $group: {
          _id: null,
          totalStudentsInMonth: { $sum: '$totalStudentsPresent' }
        }
      }
    ]);

    res.json(result);
  } catch (error) {
    console.error('Error fetching total attendance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// app.post('/messbill', async (req, res) => {
//   const { date, TotalEstablishmentcharge, TotalFoodCharge, Fine } = req.body;
//   const TotalExpense = TotalEstablishmentcharge + TotalFoodCharge;
//   const month = date.substring(0, 7);

//   try {
//       // Calculate the total attendance for the specified month
//       let NoOfAttendanceTaken = await attdce.countTotalAttendanceInMonth(month);
//       let NoOfUser=await Alloted.countStudents();
//       console.log("NoOfUser=",NoOfUser)
//       console.log("attdce taken",NoOfAttendanceTaken)
//       let TotalAttendance=NoOfAttendanceTaken*NoOfUser;
//       console.log("total",TotalAttendance)
//       // Get all students
//       const students = await Alloted.find();
//     //total=noofuserxtotal presnt day
//       let TotalAbsentDays = 0;
//       students.forEach(student => {
//           let absentDaysInSequence = 0;
//           let lastAbsentDate = null;
        
//           // 
//           // Iterate through the days of the month
//           for (let day = 1; day <= 30; day++) {
//               const currentDate = `${month}-${day.toString().padStart(2, '0')}`;
//               console.log(currentDate)
//               // Check if the student is absent on the current date
//               if (student.absenceStreaks.get(currentDate) > 0) {
//                   // If the student is absent, check if it's part of a consecutive absence streak
//                   if (!lastAbsentDate || day - lastAbsentDate === 1) {
//                       absentDaysInSequence++;
//                   } else {
//                       absentDaysInSequence = 1; // Reset streak if not consecutive
//                   }
//                   lastAbsentDate = day;
//                   console.log(lastAbsentDate);
//                   console.log("hello",absentDaysInSequence);
                  
                 
//                   // Check if the streak is a multiple of 7 days
//                   if (absentDaysInSequence >= 7 && absentDaysInSequence % 7 === 0) {
//                     console.log("if");
//                       TotalAbsentDays += 7; // Add multiples of 7 days to total absent days
//                       TotalAttendance -= 7; // Subtract multiples of 7 days from total attendance
//                       console.log("if",TotalAttendance);
//                     }

//               } else {
//                   absentDaysInSequence = 0;
//                   console.log("else"); // Reset streak if student is present
//               }
//           }
//       });

//       // Calculate essential charge and rate per day
//       const esscharge = TotalEstablishmentcharge / students.length;
//       const RatePerDay = (TotalFoodCharge-Fine) / TotalAttendance;

//       // Create a new MessBill instance
//       const MessBill = new MessBillSchema({
//           date,
//           NumberofUser: students.length,
//           TotalEstablishmentcharge,
//           TotalFoodCharge,
//           TotalExpense,
//           esscharge,
//           TotalAttendance,
//           RatePerDay,
//           Fine,
//       });

//       // Save the MessBill instance and update absence streaks for students
//       await MessBill.save();
//       await Promise.all(students.map(student => student.save()));

//       res.status(201).json({ message: 'Mess bill calculated and saved successfully' });
//   } catch (error) {
//       console.error('Error calculating and saving mess bill:', error);
//       res.status(500).json({ error: 'Failed to calculate and save mess bill' });
//   }
// });

app.post('/messbill', async (req, res) => {
  const { date, TotalEstablishmentcharge, TotalFoodCharge, Fine } = req.body;
  
  const month = date.substring(0, 7);

  try {
      // Calculate the total attendance for the specified month
      let NoOfAttendanceTaken = await attdce.countTotalAttendanceInMonth(month);
      let NoOfUser = await Alloted.countStudents();
      console.log("NoOfUser=", NoOfUser);
      console.log("attdce taken", NoOfAttendanceTaken);
      let TotalAttendance = NoOfAttendanceTaken * NoOfUser;
      console.log("total", TotalAttendance);
      const TotalExpense = TotalEstablishmentcharge + TotalFoodCharge;
      // Get all students
      const students = await Alloted.find();
      //total=noofuserxtotal presnt day
      let TotalAbsentDays = 0;
      students.forEach(student => {
          let absentDaysInSequence = 0;
          let lastAbsentDate = null;

          // Iterate through the days of the month
          for (let day = 1; day <= 30; day++) {
              const currentDate = `${month}-${day.toString().padStart(2, '0')}`;
              console.log(currentDate);
              // Check if the student is absent on the current date
              if (student.absenceStreaks.get(currentDate) > 0) {
                  // If the student is absent, check if it's part of a consecutive absence streak
                  if (!lastAbsentDate || day - lastAbsentDate === 1) {
                      absentDaysInSequence++;
                  } else {
                      absentDaysInSequence = 1; // Reset streak if not consecutive
                  }
                  lastAbsentDate = day;
                  console.log(lastAbsentDate);
                  console.log("hello", absentDaysInSequence);


                  // Check if the streak is a multiple of 7 days
                  if (absentDaysInSequence >= 7 && absentDaysInSequence % 7 === 0) {
                      console.log("if");
                      TotalAbsentDays += 7; // Add multiples of 7 days to total absent days
                      TotalAttendance -= 7; // Subtract multiples of 7 days from total attendance
                      console.log("if", TotalAttendance);
                  }

              } else {
                  absentDaysInSequence = 0;
                  console.log("else"); // Reset streak if student is present
              }
          }

          // Calculate mess cut for the student
          const messCut = (TotalAttendance - student.absentDaysInMonth) ;
          console.log(`Mess cut for ${student.Name} is ${messCut}`);
      });

      // Calculate essential charge and rate per day
      const esscharge = TotalEstablishmentcharge / students.length;
      const RatePerDay = (TotalFoodCharge - Fine) / TotalAttendance;

      // Create a new MessBill instance
      const MessBill = new MessBillSchema({
          date,
          NumberofUser: students.length,
          TotalEstablishmentcharge,
          TotalFoodCharge,
          TotalExpense,
          esscharge,
          TotalAttendance,
          RatePerDay,
          Fine,
      });

      // Save the MessBill instance and update absence streaks for students
      await MessBill.save();
      await Promise.all(students.map(student => student.save()));

      res.status(201).json({ message: 'Mess bill calculated and saved successfully' });
  } catch (error) {
      console.error('Error calculating and saving mess bill:', error);
      res.status(500).json({ error: 'Failed to calculate and save mess bill' });
  }
});
// GET endpoint to fetch the latest mess bill data
app.get('/latest-messbill', async (req, res) => {
  try {
    // Retrieve the latest mess bill data from the database
    const latestMessBill = await MessBillSchema.findOne({}, {}, { sort: { 'date': -1 } });

    if (!latestMessBill) {
      return res.status(404).json({ error: 'Latest mess bill data not found' });
    }

    // Send the latest mess bill data to the frontend
    res.status(200).json({ messBillData: latestMessBill });
  } catch (error) {
    console.error('Error fetching latest mess bill data:', error);
    res.status(500).json({ error: 'Failed to fetch latest mess bill data' });
  }
});







// Your existing route handler for generating mess bills
app.post('/messbilll', async (req, res) => {
  const { date, TotalEstablishmentcharge, TotalFoodCharge, Fine } = req.body;
  const TotalExpense = TotalEstablishmentcharge + TotalFoodCharge;
  const month = date.substring(0, 7);

  try {
    // Calculate the total attendance for the specified month
    let NoOfAttendanceTaken = await attdce.countTotalAttendanceInMonth(month);
    let NoOfUser = await Alloted.countStudents();
    console.log("NoOfUser=", NoOfUser);
    console.log("attdce taken", NoOfAttendanceTaken);
    let TotalAttendance = NoOfAttendanceTaken * NoOfUser;
    console.log("total", TotalAttendance);

    // Get all students
    const students = await Alloted.find();
    const messGen = await MessBillSchema.findOne(); // Assuming month and year fields in the schema

    // Check if the messGen object exists and has valid RatePerDay and esscharge values
    if (messGen && messGen.RatePerDay && messGen.esscharge) {
      // Create an array to hold mess bills for all students
      let messBills = [];

      // Iterate through each student to calculate and store their mess bill
      for (const student of students) {
        let absentDaysInSequence = 0;
        let lastAbsentDate = null;
        let totalAbsentDays = 0;

        // Iterate through the days of the month
        for (let day = 1; day <= 30; day++) {
          const currentDate = `${month}-${day.toString().padStart(2, '0')}`;
          console.log(currentDate);

          // Check if the student is absent on the current date
          if (student.absenceStreaks.get(currentDate) > 0) {
            // If the student is absent, check if it's part of a consecutive absence streak
            if (!lastAbsentDate || day - lastAbsentDate === 1) {
              absentDaysInSequence++;
            } else {
              absentDaysInSequence = 1; // Reset streak if not consecutive
            }
            lastAbsentDate = day;
            console.log(lastAbsentDate);
            console.log("hello", absentDaysInSequence);

            // Check if the streak is a multiple of 7 days
            if (absentDaysInSequence >= 7 && absentDaysInSequence % 7 === 0) {
              console.log("if");
              totalAbsentDays += 7; // Add multiples of 7 days to total absent days
              console.log("if", totalAbsentDays);
            }
          } else {
            absentDaysInSequence = 0;
            console.log("else"); // Reset streak if student is present
          }
        }

        // Calculate mess cut for the student
        const messCut = totalAbsentDays; // You can modify this based on your mess cut logic

        // Calculate amount for the student
        const amount = (messGen.RatePerDay * (NoOfAttendanceTaken - messCut)) + messGen.esscharge;

        // Create a new mess bill object for the student
        const messBill = {
          date,
          Room_No: student.Room_No,
          Name: student.Name,
          AdmNo: student.AdmNo,
          yearOfStudy: student.yearOfStudy,
          Amount: amount,
          TotalAmount: amount + Fine, // Assuming TotalAmount is Amount + Fine
          Fine: Fine,
          TotalAttendance: NoOfAttendanceTaken - messCut,
        };

        // Push the mess bill object to the messBills array
        messBills.push(messBill);
      }

      // Create a new MessBillGen instance and save it
      const messBillGen = new MessBillGen({
        month: month,
        messBills: messBills, // Assign the array of mess bills to the messBills field
      });
      await messBillGen.save();

      res.status(201).json({ message: 'Mess bills calculated and saved successfully' });
    } else {
      console.error('RatePerDay or esscharge is missing or invalid');
      res.status(400).json({ error: 'RatePerDay or esscharge is missing or invalid' });
    }
  } catch (error) {
    console.error('Error calculating and saving mess bills:', error);
    res.status(500).json({ error: 'Failed to calculate and save mess bills' });
  }
});
// GET endpoint to fetch the mess bill of the latest date
app.get('/messbillgen', async (req, res) => {
  try {
    // Retrieve the latest mess bill generated from the database
    const latestMessBill = await MessBillGen.findOne({}, {}, { sort: { 'month': -1 } });

    if (!latestMessBill) {
      return res.status(404).json({ error: 'Latest mess bill not found' });
    }

    // Send the latest mess bill data to the frontend
    res.status(200).json({ latestMessBill });
  } catch (error) {
    console.error('Error fetching latest mess bill:', error);
    res.status(500).json({ error: 'Failed to fetch latest mess bill' });
  }
});


// ------------------------------
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
