const express = require('express');
const mongoDB = require('./db');
const User = require('./models/UserSchema');
const User2 = require('./models/UserSchema2');
const attdce=require('./models/attendanceSchema');
const Alloted=require('./models/AllotedSchema')
const MessDutySchema=require('./models/MessDutyAllocation');
const MessBillSchema=require('./models/MessBillSchema');
const Room=require('./models/Room');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();


const app = express();
const port = 5000;


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
  try {
    const { date, studentsPresent } = req.body;

    // Check if the date is empty
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // Create new attendance record
    const attendance = new attdce({
      date,
      studentsPresent,
    });

    // Save the attendance record to the database
    const savedAttendance = await attendance.save();

    res.status(201).json({ message: 'Attendance saved successfully', attendance: savedAttendance });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
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

    // Create a new document in the Alloted schema
    const allottedStudent = new Alloted({
      Name: student.Name,
      AdmNo:student.AdmNo,
      PhoneNo:student.PhoneNo,
      password:student.PhoneNo,
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

    // Update room details
    availableRoom.capacity--; // Decrement room capacity
    availableRoom.copystudents.push(studentId); // Add student to the room's list of students
    if (availableRoom.capacity === 0) {
      availableRoom.availability = false; // Set availability to false if room is full
    }
    await availableRoom.save();
    
    await User.deleteOne({ _id: studentId });

    return res.status(200).json({ message: 'Room allotted successfully', roomNo: availableRoom.Room_No });
  } catch (error) {
    console.error('Error allotting room to student:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


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

app.post('/messbill', async (req, res) => {
  const { date, TotalEstablishmentcharge, TotalFoodCharge, Fine } = req.body;
  const TotalExpense = TotalEstablishmentcharge + TotalFoodCharge;
  const month = date.substring(0, 7); 
  const TotalAttendance = await attdce.countTotalStudentsInMonth(month);
  const NumberofUser = await getTotalStudents(); 
  const esscharge = TotalEstablishmentcharge / NumberofUser;
  const RatePerDay=TotalFoodCharge/TotalAttendance;

  
  const MessBill = new MessBillSchema({
    date,
    NumberofUser,
    TotalEstablishmentcharge,
    TotalFoodCharge,
    TotalExpense,
    esscharge,
    TotalAttendance,
    RatePerDay, 
  });

  try {
    await MessBill.save();
    res.status(201).json({ message: 'Mess bill calculated and saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate and save mess bill' });
  }
});




async function getTotalStudents() {
  try {
    const totalStudents = await Alloted.countStudents();
    console.log('Total number of students:', totalStudents);
    return totalStudents;
  } catch (err) {
    console.error('Error counting students:', err);
  }
}
// async function counts(req, res)  {
//   try {
//     const result = await attdce.aggregate([
//       {
//         $unwind: '$studentsPresent' // Unwind the studentsPresent array
//       },
//       {
//         $group: {
//           _id: '$studentsPresent', // Group by student ID
//           count: { $sum: 1 } // Count the occurrences
//         }
//       },
//       {
//         $lookup: {
//           from: 'users', // Look up data from the 'users' collection
//           localField: '_id',
//           foreignField: '_id',
//           as: 'studentData'
//         }
//       },
//       {
//         $unwind: '$studentData' // Unwind the studentData array
//       },
//       {
//         $project: {
//           _id: 0, // Exclude the _id field
//           studentId: '$_id',
//           studentName: '$studentData.Name',
//           count: 1 // Include the count field
//         }
//       }
//     ]);

//     const studentsPresentCounts = {};
//     result.forEach(item => {
//       studentsPresentCounts[item.studentName] = item.count;
//     });
//     console.log(studentsPresentCounts);
//     // res.json(studentsPresentCounts);
//   } catch (error) {
//     console.error('Error getting attendance count for students:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }



// ------------------------------
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
