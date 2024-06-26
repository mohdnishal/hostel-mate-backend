const jwt = require('jsonwebtoken');
const dotenv=require('dotenv');
dotenv.config()
const createToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.SECRET, { expiresIn: '2d' });
  };


const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  try {
    const tokenWithoutBearer = token.split(' ')[1];
    console.log('Received token:', tokenWithoutBearer); 
    const decoded = jwt.verify(tokenWithoutBearer, process.env.SECRET);
    console.log('Decoded token:', decoded); 
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};



module.exports = { createToken,authMiddleware };
