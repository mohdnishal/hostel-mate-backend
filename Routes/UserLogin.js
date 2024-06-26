const express = require('express');
const Alloted=require('../models/AllotedSchema')
const bcrypt= require('bcryptjs');
const jwt=require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { createToken, authMiddleware } = require('../middleware/middleWare');
const router = express.Router();
 router.post('/login', async (req, res) => {
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
router.get('/nextpage', authMiddleware, async (req, res) => {
    try {
      // Extract user ID from decoded JWT token
      const userId = req.user.id;
      console.log("user",userId);
      // Fetch user details from MongoDB based on user ID
      const user = await Alloted.findById(userId).select('-password');
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      console.log("userers",user);
      res.json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/change-password', authMiddleware, async (req, res) => {
    try {
      const { newPassword } = req.body;
      const userId = req.user.id; // Extract user ID from the authenticated request
  
      // Fetch the user from the database
      const user = await Alloted.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password in the database
      user.password = hashedNewPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing password:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  });
module.exports = router;