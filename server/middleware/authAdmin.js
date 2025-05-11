// middleware/authAdmin.js
import jwt from 'jsonwebtoken';

const authAdmin = () => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ensure token is from an admin
      if (!decoded.id || decoded.role !== 'admin') {
        return res.status(401).json({ message: 'Invalid token payload for admin.' });
      }

      req.admin = decoded; // Attach admin info to request
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
  };
};

export default authAdmin;
