// backend/check-fooditem-model.js
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    
    // Load FoodItem model
    const FoodItem = require('./models/FoodItem');
    
    console.log('\n🔍 FoodItem Model Schema:');
    console.log('Schema Paths:', Object.keys(FoodItem.schema.paths));
    
    // Check the category field specifically
    const categoryPath = FoodItem.schema.paths.category;
    if (categoryPath) {
        console.log('\n📋 Category field details:');
        console.log('Instance:', categoryPath.instance);
        console.log('Options:', categoryPath.options);
        
        if (categoryPath.enumValues) {
            console.log('Allowed values (enum):', categoryPath.enumValues);
        }
    }
    
    // Check other enum fields
    console.log('\n🔍 All enum fields in FoodItem:');
    Object.keys(FoodItem.schema.paths).forEach(path => {
        const schemaType = FoodItem.schema.paths[path];
        if (schemaType.enumValues) {
            console.log(`  - ${path}:`, schemaType.enumValues);
        }
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Debug complete!');
})
.catch(err => {
    console.error('❌ Error:', err);
});