// backend/check-gallery-model.js
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    
    // Load Gallery model
    const Gallery = require('./models/Gallery');
    
    console.log('\n🔍 Gallery Model Schema:');
    console.log('Schema Paths:', Object.keys(Gallery.schema.paths));
    
    // Check required fields
    console.log('\n📋 Required fields in Gallery:');
    Object.keys(Gallery.schema.paths).forEach(path => {
        const schemaType = Gallery.schema.paths[path];
        if (schemaType.isRequired) {
            console.log(`  - ${path}: ${schemaType.instance}`);
        }
    });
    
    // Check the exact field names
    console.log('\n🔍 Checking field names:');
    const tree = Gallery.schema.tree;
    Object.keys(tree).forEach(key => {
        console.log(`  ${key}:`, typeof tree[key] === 'object' ? JSON.stringify(tree[key]) : tree[key]);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Debug complete!');
})
.catch(err => {
    console.error('❌ Error:', err);
});