const express = require('express');
const mongoDB = require('./db');
const User = require('./models/UserSchema');
const User2 = require('./models/UserSchema2');
const attdce=require('./models/attendanceSchema');
const Alloted=require('./models/AllotedSchema')
const MessDutySchema=require('./models/MessDutyAllocation');
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
    const { attendanceData } = req.body;

    // Assuming attendanceData is an object with student IDs as keys
    // Iterate over each student and save attendance record
    for (const studentId in attendanceData) {
      const { date, present } = attendanceData[studentId];
      
      // Create new attendance record
      const attendance = new attdce({
        student: studentId,
        date: date,
        present: present
      });

      // Save the attendance record to the database
      await attendance.save();
    }

    res.status(201).json({ message: 'Attendance saved successfully' });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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

// Route to handle room allocation

// Backend API route to fetch allotted details sorted by room number
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

// Route to allocate mess duty for the first available room
// Add this route to your Express.js backend
// Function to format date to "Sat Jun 01 2024" format
function formatDate(date) {
  const options = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

let lastToDate = new Date(); // Initialize lastToDate to the current date
// Add this route to your Express.js backend
// Declare a variable to store the last allocated date

let lastAllocatedDate = new Date(); // Initialize last allocated date with the current date

app.post('/allocate-mess-duty', async (req, res) => {
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
        const fromDate = new Date(lastAllocatedDate);
        const toDate = new Date(lastAllocatedDate);
        toDate.setDate(toDate.getDate() + 1); // Add 1 day for the next day

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
        lastAllocatedDate.setDate(lastAllocatedDate.getDate() + 2); // Add 2 days for the next group
      }
      
      // Allocate duty for remaining students in the room, if any
      if (remainingStudents.length > 0) {
        const fromDate = new Date(lastAllocatedDate);
        const toDate = new Date(lastAllocatedDate);
        toDate.setDate(toDate.getDate() + 1); // Add 1 day for the next day

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
});















// Add this route to your Express.js backend




// 
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
        $match: { student: { $exists: true } }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentData'
        }
      },
      {
        $unwind: '$studentData'
      },
      {
        $group: {
          _id: {
            studentName: '$studentData.Name',
            month: { $month: { $dateFromString: { dateString: '$date' } } } // Extract month (MM) from the date field
          },
          count: { $sum: { $cond: [{ $eq: ['$present', true] }, 1, 0] } }
        }
      },
      {
        $group: {
          _id: '$_id.studentName',
          countsByMonth: { 
            $push: { 
              month: { 
                $switch: {
                  branches: [
                    { case: { $eq: ['$_id.month', 1] }, then: 'January' },
                    { case: { $eq: ['$_id.month', 2] }, then: 'February' },
                    { case: { $eq: ['$_id.month', 3] }, then: 'March' },
                    { case: { $eq: ['$_id.month', 4] }, then: 'April' },
                    { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                    { case: { $eq: ['$_id.month', 6] }, then: 'June' },
                    { case: { $eq: ['$_id.month', 7] }, then: 'July' },
                    { case: { $eq: ['$_id.month', 8] }, then: 'August' },
                    { case: { $eq: ['$_id.month', 9] }, then: 'September' },
                    { case: { $eq: ['$_id.month', 10] }, then: 'October' },
                    { case: { $eq: ['$_id.month', 11] }, then: 'November' },
                    { case: { $eq: ['$_id.month', 12] }, then: 'December' }
                  ],
                  default: 'Unknown'
                } 
              }, 
              count: '$count' 
            } 
          }
        }
      }
    ]);

    const attendanceCountsByStudent = {};
    result.forEach(item => {
      attendanceCountsByStudent[item._id] = item.countsByMonth;
    });

    res.json(attendanceCountsByStudent);
  } catch (error) {
    console.error('Error getting attendance count for students by month:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ------------------------------
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
