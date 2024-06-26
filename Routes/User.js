const express = require('express');
const Alloted=require('../models/AllotedSchema')
const Room=require('../models/Room');
const router = express.Router();

router.get('/allotted-details', async (req, res) => {
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

  
  router.post('/vacate-room', async (req, res) => {
    try {
      const { userId, roomId } = req.body;
      console.log('Request received. User ID:', userId, 'Room No:', roomId);
  
      const deletedUser = await Alloted.findByIdAndDelete(userId);
      console.log('Deleted User:', deletedUser);
  
      if (!deletedUser) {
        console.error('User not found or deletion failed');
        return res.status(404).json({ error: 'User not found or deletion failed' });
      }
  
      const updatedRoom = await Room.findOneAndUpdate(
        { Room_No: roomId },
        {
          $pull: { copystudents: userId },
          $inc: { capacity: 1 },
          $set: { availability: true }
        },
        { new: true }
      );
  
      console.log('Updated Room:', updatedRoom);
  
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

module.exports = router;