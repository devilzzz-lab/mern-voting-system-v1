import jwt from 'jsonwebtoken';

const authMiddleware = () => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log("Received Token:", token); // Debugging

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded); // Debugging

      if (!decoded.userId) {
        return res.status(401).json({ message: 'Invalid token payload. Missing userId.' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
  };
};



export default authMiddleware;
