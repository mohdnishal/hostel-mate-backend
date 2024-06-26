const express = require('express');
const ComplaintSchema=require('../models/ComplaintSchema');
const { createToken, authMiddleware } = require('../middleware/middleWare');
const router = express.Router();

router.post('/complaint', authMiddleware, async (req, res) => {
    try {
      const { complaint , Name, AdmNo} = req.body;
      
      // Validate complaint data (example: check if complaint is not empty)
      if (!complaint) {
        return res.status(400).json({ error: 'Complaint cannot be empty' });
      }
  
      const newComplaint = new ComplaintSchema({
        Name,
        AdmNo,
        Complaint: complaint,
      });
  
      await newComplaint.save();
  
      res.status(200).json({ success: true, message: 'Complaint submitted successfully' });
    } catch (error) {
      console.error('Error submitting complaint:', error); // Log the full error object for debugging
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  
  router.get('/viewcomplaint', async (req, res) => {
    try {
      const complaints = await ComplaintSchema.find(); // Assuming ComplaintSchema is your Mongoose model
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;