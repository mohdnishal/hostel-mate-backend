const express = require('express')
 const mongoDB=require('./db');
 const User=require('./models/UserSchema')
const cors=require('cors');
const app = express()
const port = 5000

 mongoDB();
app.use(
  cors({
    credentials:true,
    origin:'http://localhost:3000'
  })
)
app.get('/test', (req, res) => {
    res.json('Hello World!');
  })
   app.use(express.json());
// app.use('/api',require("./Routes/StudentDetails"));
app.post('/register',async(req,res)=>{
  const {Name,PhoneNo,EmergencyPhoneNo,Gender,Degree,admNo,YearOfStudy,Branch,PAddress1,
    PAddress2,PPincode,PDistrict,PState,PCountry,adhar,RAddressLine1,RAddress2,RPincode,RDistrict,RState,RCountry,
  Income,IncomeCertificate,GName,GPhoneNo,Relation,GAddress1,GAddress2,GPincode,GDistrict,GState,GCountry}=req.body;
  try {
    const StudentInfo=await User.create({
      Name,PhoneNo,EmergencyPhoneNo,Gender,Degree,admNo,YearOfStudy,Branch,PAddress1,
    PAddress2,PPincode,PDistrict,PState,PCountry,adhar,RAddressLine1,RAddress2,RPincode,RDistrict,RState,RCountry,
  Income,IncomeCertificate,GName,GPhoneNo,Relation,GAddress1,GAddress2,GPincode,GDistrict,GState,GCountry
    }) 
    res.json(StudentInfo)
  } catch (error) {
    res.status(600).json(error)
    console.log(error);
  }
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })