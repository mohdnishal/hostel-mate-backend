const express = require('express');
const mongoDB = require('./db');
const cors = require('cors');
const dotenv=require('dotenv');
const cookieParser = require('cookie-parser');
dotenv.config()
const app = express();
const port = 5000;
app.use(cookieParser())
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Registration = require('./Routes/Registration.js'); 
const Attendance = require('./Routes/Attendance'); 
const Allotment = require('./Routes/Allotment');
const MessDuty = require('./Routes/MessDuty');
const MessBill = require('./Routes/MessBill');
const Complaint = require('./Routes/Complaint');
const Userr = require('./Routes/User');
const UserLogin = require('./Routes/UserLogin'); 

// Initialization

// Connect to MongoDB
mongoDB();

app.use(
  cors({
    credentials: true,
    origin: ['https://hostel-mate-frontend.vercel.app'],
    methods:["GET","POST","DELETE"]
  })

);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// -----------------Registartion Routes ------------
app.use('/api', Registration);
//-----------------/Registration-------------------------------------
// ------------Attendance-----------------
app.use('/api', Attendance);
// ------------/Attendance-----------------
//-------------Allotment------------------
app.use('/api', Allotment);
//-------------/Allotment------------------
// ------------MessDuty------------------
app.use('/api', MessDuty);
// ---------------/MessDuty------------
// ---------------MessBill-------------
app.use('/api', MessBill);
// ----------------/MessBill------------
// --------------Complaint-------------
app.use('/api', Complaint);
// ---------------/Complaint------------
// --------------User---------------
app.use('/api', Userr);
// --------------/user------------
app.use('/api', UserLogin);
//-------------- Distance calculation----------------
app.post('/calculate',async (req,res)=>{
  console.log(req.body)
  async function fetchLatLngFromServer(pin) {
      console.log("hii")
        try {
          const baseURL = 'https://geocode.maps.co';
          const apiKey = '6639e4cb2246a707291706fnib727f3';
          const url = `${baseURL}/search?q=${encodeURIComponent(pin)}&api_key=${apiKey}`;
      
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
      
          const responseData = await response.json();
          const { lat, lon } = responseData[0];
          console.log(lat)
          console.log(lon)
          return { lat, lon };
        } catch (error) {
          throw error;
        }
      }
      async function fetchDistanceMatrixData(origins, destinations, key) {
        try {
          const url = `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${key}`;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        } catch (error) {
          throw error;
        }
      }
    
      
    
      const calculate= async () => {
        try {
       
          const { lat, lon } = await fetchLatLngFromServer(req.body.pin);
          console.log(lat)
          console.log(lon)
          const originLat = 9.580992388235295;
          const originLong = 76.61141034117648;
          const distanceMatrixData = await fetchDistanceMatrixData(
            `${originLat},${originLong}`,
            `${lat},${lon}`,
            'w3J0aRCbAj8zzhTWxqrWAGc7nVZisemh4JHDhzyV82TZv2WRCCWctRGujkfOkMJh'
          );
          console.log('Distance Matrix Data:', distanceMatrixData.rows[0].elements);
           res.json(distanceMatrixData.rows[0].elements)
        } catch (error) {
          console.error('Error:', error.message);
        }
      };
      calculate()

})
//--------------/Distance calculation----------------


app.post('/api/pay', async (req, res) => {
  const { amount, id, payerName, payerMail } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // amount in cents
      currency: 'inr',
      payment_method: id,
      confirmation_method: 'manual',
      confirm: true,
      receipt_email: payerMail,
      return_url: 'http://localhost:3000/return', // your return URL
      
    });

    if (paymentIntent.status === 'requires_action' && paymentIntent.next_action.type === 'use_stripe_sdk') {
      // Tell the client to handle the action
      res.send({
        requires_action: true,
        payment_intent_client_secret: paymentIntent.client_secret,
      });
    } else {
      
      res.send({ success: true });
    }
  } catch (error) {
    res.send({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
