// backend/setup-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const Admin = require('./models/Admin');
    
    // Clear old admin
    await Admin.deleteOne({ email: 'upasanacatering@gmail.com' });
    
    // Create new admin
    const salt = await bcrypt.genSalt(10);
    const admin = new Admin({
      username: 'superadmin',
      email: 'upasanacatering@gmail.com',
      name: 'Super Admin',
      role: 'superadmin',
      isActive: true,
      password: await bcrypt.hash('Upasana2024!', salt)
    });
    
    await admin.save();
    
    console.log('\n✅ ADMIN ACCOUNT CREATED!');
    console.log('Email: upasanacatering@gmail.com');
    console.log('Password: Upasana2024!');
    console.log('\n✅ PASSWORD RESET WILL NOW WORK!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupAdmin();