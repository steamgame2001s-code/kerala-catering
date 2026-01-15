// backend/check-admin-accounts.js
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function checkAdmins() {
  try {
    console.log('🔍 Checking admin accounts in database...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Get all admin accounts
    const admins = await Admin.find({});
    
    console.log(`\n📊 Found ${admins.length} admin account(s):`);
    
    if (admins.length === 0) {
      console.log('❌ No admin accounts found!');
    } else {
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. Admin Account:`);
        console.log(`   ID: ${admin._id}`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Active: ${admin.isActive}`);
        console.log(`   Created: ${admin.createdAt.toLocaleDateString()}`);
        console.log(`   Last Login: ${admin.lastLogin ? admin.lastLogin.toLocaleDateString() : 'Never'}`);
      });
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdmins();