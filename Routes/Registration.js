// const express = require('express');
// const User = require('../models/UserSchema');
// const User2 = require('../models/UserSchema2');
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');
// const router = express.Router();
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       const uploadDir = './files';
//       // Create the destination directory if it doesn't exist
//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }
//       cb(null, uploadDir);
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now();
//       cb(null, uniqueSuffix + file.originalname);
//     }
//   });
  
//   const upload = multer({ storage: storage });
//   const isValidPhoneNumber = (phoneNumber) => {
//     return /^\d{10}$/.test(phoneNumber) && !phoneNumber.startsWith('0');
//   };

// router.post('/register', upload.fields([{ name: 'IncomeCertificate', maxCount: 1 }, { name: 'Adhar', maxCount: 1 }]), async (req, res) => {
//     console.log(req.file);
//     const {
//       Name, PhoneNo, Email, Gender, Degree, AdmNo, YearOfStudy, Branch, PAddress1,
//       PAddress2, PPincode,Distance, PDistrict, PState, PCountry, RAddressLine1, RAddress2, RPincode, RDistrict, RState, RCountry,
//       Income, GName, GPhoneNo, Relation, GAddress1, GAddress2, GPincode, GDistrict, GState, GCountry, Priority
//     } = req.body;
  
//     // Validate PhoneNo
//     if (!isValidPhoneNumber(PhoneNo)) {
//       return res.status(400).json({ error: 'Invalid Phone Number' });
//     }
  
//     try {
//       const StudentInfo = await User.create({
//         Name, PhoneNo, Email, Gender, Degree, AdmNo, YearOfStudy, Branch, PAddress1,
//         PAddress2, PPincode,Distance, PDistrict, PState, PCountry, Adhar: req.files['Adhar'][0].filename, RAddressLine1, RAddress2, RPincode, RDistrict, RState, RCountry,
//         Income, IncomeCertificate: req.files['IncomeCertificate'][0].filename, GName, GPhoneNo, Relation, GAddress1, GAddress2, GPincode, GDistrict, GState, GCountry, Priority
//       });
//       res.json(StudentInfo);
//     } catch (error) {
//       res.status(500).json({ error: 'Internal Server Error' });
//       console.error(error);
//     }
//   });
//    router.use("/files",express.static("files"));
//     router.post('/copyregister', async (req, res) => {
//     try {
      
//       const { Date, Name, PhoneNo, Email, Gender, Degree, AdmNo, YearOfStudy, Branch, PAddress1, PAddress2, PPincode, PDistrict, PState, PCountry, RAddressLine1, RAddress2, RPincode, RDistrict, RState, RCountry, Income, GName, GPhoneNo, Relation, GAddress1, GAddress2, GPincode, GDistrict, GState, GCountry, Priority } = req.body;
  
//       // Ensure that IncomeCertificate and Adhar are provided
      
//       const newData = await User2.create({
//         Date, Name, PhoneNo, Email, Gender, Degree, AdmNo, YearOfStudy, Branch, PAddress1, PAddress2, PPincode, PDistrict, PState, PCountry,
//         RAddressLine1, RAddress2, RPincode, RDistrict, RState, RCountry, Income, GName, GPhoneNo, Relation, GAddress1, GAddress2, GPincode, GDistrict, GState, GCountry, Priority,
  
//       });
  
//       res.status(200).json({ message: 'Data copied to another schema successfully' });
//     } catch (error) {
//       console.error('Error copying data to another schema:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });

// module.exports = router;
const express = require('express');
const User = require('../models/UserSchema');
const User2 = require('../models/UserSchema2');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();

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
const isValidPhoneNumber = (phoneNumber) => {
  return /^\d{10}$/.test(phoneNumber) && !phoneNumber.startsWith('0');
};

router.post('/register', upload.fields([{ name: 'IncomeCertificate', maxCount: 1 }, { name: 'Adhar', maxCount: 1 }]), async (req, res) => {
  console.log(req.file);
  const {
    Name, PhoneNo, Email, Gender, Degree, AdmNo, YearOfStudy, Branch, PAddress1,
    PAddress2, PPincode, Distance, PDistrict, PState, PCountry, RAddressLine1, RAddress2, RPincode, RDistrict, RState, RCountry,
    Income, GName, GPhoneNo, Relation, GAddress1, GAddress2, GPincode, GDistrict, GState, GCountry, Priority
  } = req.body;

  // Validate PhoneNo
  if (!isValidPhoneNumber(PhoneNo)) {
    return res.status(400).json({ error: 'Invalid Phone Number' });
  }

  try {
    const StudentInfo = await User.create({
      Name, PhoneNo, Email, Gender, Degree, AdmNo, YearOfStudy, Branch, PAddress1,
      PAddress2, PPincode, Distance, PDistrict, PState, PCountry, Adhar: req.files['Adhar'][0].filename, RAddressLine1, RAddress2, RPincode, RDistrict, RState, RCountry,
      Income, IncomeCertificate: req.files['IncomeCertificate'][0].filename, GName, GPhoneNo, Relation, GAddress1, GAddress2, GPincode, GDistrict, GState, GCountry, Priority
    });
    res.json(StudentInfo);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
    console.error(error);
  }
});

router.use("/files", express.static("files"));

router.post('/copyregister', async (req, res) => {
  try {
    const { Date, Name, PhoneNo, Email, Gender, Degree, AdmNo, YearOfStudy, Branch, PAddress1, PAddress2, PPincode, PDistrict, PState, PCountry, RAddressLine1, RAddress2, RPincode, RDistrict, RState, RCountry, Income, GName, GPhoneNo, Relation, GAddress1, GAddress2, GPincode, GDistrict, GState, GCountry, Priority } = req.body;

    const newData = await User2.create({
      Date, Name, PhoneNo, Email, Gender, Degree, AdmNo, YearOfStudy, Branch, PAddress1, PAddress2, PPincode, PDistrict, PState, PCountry,
      RAddressLine1, RAddress2, RPincode, RDistrict, RState, RCountry, Income, GName, GPhoneNo, Relation, GAddress1, GAddress2, GPincode, GDistrict, GState, GCountry, Priority,
    });

    res.status(200).json({ message: 'Data copied to another schema successfully' });
  } catch (error) {
    console.error('Error copying data to another schema:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
