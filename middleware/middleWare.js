const jwt = require('jsonwebtoken');
const dotenv=require('dotenv');
dotenv.config()
const createToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.SECRET, { expiresIn: '2d' });
  };

// Middleware to authenticate requests
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

module.exports = { createToken,authMiddleware };
