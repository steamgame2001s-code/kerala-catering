// backend/create-db.js
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kerala-catering', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', async () => {
    console.log('✅ Connected to MongoDB database: kerala-catering');
    
    // Check if database exists and has collections
    const collections = await db.db.listCollections().toArray();
    console.log('📊 Collections in database:');
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    if (collections.length === 0) {
        console.log('⚠️ Database is empty. Please seed it with:');
        console.log('   curl http://localhost:5000/api/seed');
    }
    
    mongoose.connection.close();
});