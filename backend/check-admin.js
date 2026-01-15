// backend/check-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const admin = await Admin.findOne({ email: 'upasanacatering@gmail.com' });
    
    if (admin) {
        console.log('\n📋 Admin found in database:');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Password hash exists: ${admin.password ? 'Yes' : 'No'}`);
        console.log(`   Password length: ${admin.password?.length || 0} characters`);
        
        // Test with common passwords
        console.log('\n🔍 Testing common passwords:');
        
        // Test with what's in your .env
        const bcrypt = require('bcryptjs');
        const envPassword = process.env.ADMIN_PASSWORD;
        
        if (envPassword && admin.password) {
            const isMatch = await bcrypt.compare(envPassword, admin.password);
            console.log(`   Password from .env matches: ${isMatch ? '✅ YES' : '❌ NO'}`);
            console.log(`   .env password length: ${envPassword.length} characters`);
        }
        
    } else {
        console.log('❌ No admin found with that email');
    }
    
    mongoose.connection.close();
});