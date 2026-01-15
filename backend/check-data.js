// Create a file: backend/check-data.js
const mongoose = require('mongoose');
const Festival = require('./models/Festival');
const FoodItem = require('./models/FoodItem');

mongoose.connect('mongodb://localhost:27017/kerala-catering', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function checkData() {
    try {
        console.log('📊 Checking database data...\n');
        
        // Check festivals
        const festivals = await Festival.find();
        console.log('🎉 Festivals in database:', festivals.length);
        festivals.forEach(f => {
            console.log(`  - ${f.name} (slug: ${f.slug})`);
        });
        
        // Check food items
        const foodItems = await FoodItem.find();
        console.log('\n🍽️ Food Items in database:', foodItems.length);
        foodItems.forEach(fi => {
            console.log(`  - ${fi.name} (₹${fi.price}) - Festival: ${fi.festival}`);
        });
        
        if (festivals.length === 0) {
            console.log('\n⚠️ No festivals found! Seeding database...');
            // You can run seed manually or implement auto-seed here
        }
        
        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkData();