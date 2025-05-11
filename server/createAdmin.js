import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set in .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ MongoDB Connected');

    const plainPassword = 'admin123';
    console.log('🔑 Plain Password:', plainPassword);

    // Ensure clean state
    await Admin.deleteOne({ email: 'admin@example.com' });

    // Create admin (password will be hashed by pre-save hook)
    const admin = new Admin({
      name: 'Main Admin',
      email: 'admin@example.com',
      phone: '9999999999',
      aadhaar: '123412341234',
      password: plainPassword
    });

    await admin.save();
    console.log('✅ Admin created successfully');

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  });
