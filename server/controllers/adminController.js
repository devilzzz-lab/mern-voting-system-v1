import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const loginAdmin = async (req, res) => {
  const { identifier, password } = req.body;

  console.log('⏩ Admin Login Attempt');
  console.log('📥 Received Identifier:', identifier);
  console.log('📥 Received Password:', password);

  try {
    const admin = await Admin.findOne({
      $or: [
        { email: identifier },
        { phone: identifier },
        { aadhaar: identifier }
      ]
    });

    if (!admin) {
      console.log('❌ Admin not found with given identifier');
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    console.log('✅ Admin found:', admin.email);
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      console.log('❌ Passwords do not match');
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('✅ Login Successful. Token generated.');
    return res.json({ token });

  } catch (err) {
    console.error('💥 Admin login failed:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
