require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const Festival = require('./models/Festival');
const FoodItem = require('./models/FoodItem');
const Admin = require('./models/Admin');
const User = require('./models/User');
const Gallery = require('./models/Gallery');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ Connection Error:', err));

const seedData = async () => {
    try {
        // Clear existing data
        console.log('🗑️ Clearing existing data...');
        await Festival.deleteMany({});
        await FoodItem.deleteMany({});
        await Admin.deleteMany({});
        await Gallery.deleteMany({});
        await User.deleteMany({});
        console.log('✅ Old data cleared\n');

        // Get admin credentials from environment variables
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@keralacatering.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create admin user
        console.log('👑 Creating admin user...');
        const admin = await Admin.create({
            username: 'superadmin',
            name: 'Super Admin',
            email: adminEmail,
            password: hashedPassword, // Store hashed password
            role: 'superadmin',
            isActive: true,
            permissions: {
                manageFestivals: true,
                manageMenu: true,
                manageGallery: true,
                manageOrders: true,
                manageUsers: true
            }
        });
        console.log(`✅ Admin created: ${admin.email}\n`);

        // Create festivals
        console.log('🎉 Creating festivals...');
        const festivals = [
            {
                name: 'Christmas',
                slug: 'christmas',
                description: 'Experience the joy of Kerala Christmas with our traditional feast. From Chicken Biriyani to Plum Cake, we bring you authentic flavors passed down through generations.',
                image: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                bannerImage: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                priceFrom: 299,
                rating: 4.8,
                reviewCount: 124,
                categories: ['Biriyani', 'Roast', 'Fish Curry', 'Desserts'],
                popularItems: ['Chicken Biriyani', 'Beef Roast', 'Fish Molee', 'Plum Cake'],
                festivalDates: 'Dec 24-26, 2024',
                deliveryInfo: 'Free delivery on orders above ₹500',
                specialNote: 'Order before Dec 20th for guaranteed Christmas delivery',
                highlights: ['Traditional recipes', 'Fresh ingredients', 'Hygienic preparation'],
                tags: ['Festive Special', 'Traditional', 'Family Meal'],
                isFeatured: true,
                isActive: true
            },
            {
                name: 'Onam',
                slug: 'onam',
                description: 'Complete Onam Sadhya with 26+ traditional items served on banana leaf. Experience the festival of harvest with authentic taste and traditional preparation methods.',
                image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                bannerImage: 'https://images.unsplash.com/photo-1567188040759-8c8916b4e6f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                priceFrom: 399,
                rating: 4.9,
                reviewCount: 218,
                categories: ['Sadhya', 'Payasam', 'Pickles', 'Banana Chips'],
                popularItems: ['Onam Sadhya', 'Avial', 'Sambar', 'Payasam'],
                festivalDates: 'Sep 5-17, 2024',
                deliveryInfo: 'Free banana leaf with every sadhya order',
                specialNote: 'Includes all traditional sadhya items with banana leaf serving',
                highlights: ['26+ traditional items', 'Served on banana leaf', 'Pure vegetarian'],
                tags: ['Traditional', 'Vegetarian', 'Festive Feast'],
                isFeatured: true,
                isActive: true
            },
            {
                name: 'Vishu',
                slug: 'vishu',
                description: 'Welcome the Malayalam New Year with Vishu Kanji, Thoran, and traditional Vishu Sadhya. Celebrate prosperity with our special menu curated for the occasion.',
                image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                bannerImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                priceFrom: 299,
                rating: 4.7,
                reviewCount: 89,
                categories: ['Kanji', 'Thoran', 'Meen Curry', 'Sadhya'],
                popularItems: ['Vishu Kanji', 'Thoran', 'Meen Curry', 'Mango Pickle'],
                festivalDates: 'Apr 14, 2024',
                deliveryInfo: 'Special Vishu packaging included',
                specialNote: 'Includes Vishu Kani arrangement suggestions with order',
                highlights: ['Traditional recipes', 'Medicinal herbs', 'Symbolic ingredients'],
                tags: ['Traditional', 'New Year', 'Cultural'],
                isFeatured: true,
                isActive: true
            },
            {
                name: 'Easter',
                slug: 'easter',
                description: 'Celebrate Easter with traditional Kerala Christian cuisine',
                image: 'https://images.unsplash.com/photo-1526262495370-ffbdf5b86612?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                priceFrom: 349,
                rating: 4.6,
                isFeatured: false,
                isActive: true
            }
        ];

        const createdFestivals = await Festival.insertMany(festivals);
        console.log(`✅ ${createdFestivals.length} festivals created\n`);

        // Create food items
        console.log('🍛 Creating food items...');
        const foodItems = [
            // Christmas items
            {
                name: 'Chicken Biriyani',
                slug: 'chicken-biriyani',
                description: 'Traditional Kerala style biriyani with masala chicken and aromatic basmati rice',
                price: 299,
                category: 'non-veg',
                festival: 'christmas',
                image: 'https://images.unsplash.com/photo-1563379091339-0326b3f5c8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                calories: 450,
                prepTime: 45,
                serves: 3,
                ingredients: ['Chicken', 'Basmati Rice', 'Onions', 'Tomatoes', 'Spices'],
                spicyLevel: 3,
                isBestSeller: true,
                isAvailable: true,
                isActive: true
            },
            {
                name: 'Beef Roast',
                slug: 'beef-roast',
                description: 'Spicy beef roast cooked in coconut gravy with traditional spices',
                price: 349,
                category: 'non-veg',
                festival: 'christmas',
                image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                calories: 380,
                prepTime: 50,
                serves: 2,
                ingredients: ['Beef', 'Coconut', 'Onions', 'Spices'],
                spicyLevel: 4,
                isBestSeller: true,
                isAvailable: true,
                isActive: true
            },
            {
                name: 'Fish Molee',
                slug: 'fish-molee',
                description: 'Kerala style fish curry in coconut milk with mild spices',
                price: 279,
                category: 'non-veg',
                festival: 'christmas',
                image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                calories: 320,
                prepTime: 35,
                serves: 2,
                ingredients: ['Fish', 'Coconut Milk', 'Spices', 'Curry Leaves'],
                spicyLevel: 2,
                isBestSeller: true,
                isAvailable: true,
                isActive: true
            },
            {
                name: 'Plum Cake',
                slug: 'plum-cake',
                description: 'Traditional Kerala Christmas plum cake with dry fruits',
                price: 199,
                category: 'dessert',
                festival: 'christmas',
                image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                calories: 320,
                prepTime: 60,
                serves: 4,
                ingredients: ['Flour', 'Dry Fruits', 'Butter', 'Sugar'],
                spicyLevel: 0,
                isBestSeller: true,
                isAvailable: true,
                isActive: true
            },
            // Onam items
            {
                name: 'Onam Sadhya (Full)',
                slug: 'onam-sadhya-full',
                description: 'Complete Onam feast with 26+ traditional items served on banana leaf',
                price: 399,
                category: 'veg',
                festival: 'onam',
                image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                calories: 1800,
                prepTime: 90,
                serves: 4,
                ingredients: ['Rice', 'Vegetables', 'Lentils', 'Coconut', 'Spices'],
                spicyLevel: 2,
                isBestSeller: true,
                isAvailable: true,
                isActive: true
            },
            {
                name: 'Avial',
                slug: 'avial',
                description: 'Mixed vegetables cooked in coconut and yogurt gravy',
                price: 149,
                category: 'veg',
                festival: 'onam',
                image: 'https://images.unsplash.com/photo-1517249361621-f11084eb8e28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                calories: 280,
                prepTime: 30,
                serves: 3,
                ingredients: ['Mixed Vegetables', 'Coconut', 'Yogurt', 'Curry Leaves'],
                spicyLevel: 1,
                isBestSeller: true,
                isAvailable: true,
                isActive: true
            },
            {
                name: 'Payasam',
                slug: 'payasam',
                description: 'Traditional sweet dessert made with milk, rice, and jaggery',
                price: 89,
                category: 'dessert',
                festival: 'onam',
                image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                calories: 280,
                prepTime: 40,
                serves: 2,
                ingredients: ['Milk', 'Rice', 'Jaggery', 'Dry Fruits'],
                spicyLevel: 0,
                isBestSeller: true,
                isAvailable: true,
                isActive: true
            },
            // Vishu items
            {
                name: 'Vishu Kanji',
                slug: 'vishu-kanji',
                description: 'Traditional rice porridge with coconut milk and medicinal herbs',
                price: 179,
                category: 'main-course',
                festival: 'vishu',
                image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                calories: 280,
                prepTime: 45,
                serves: 2,
                ingredients: ['Rice', 'Coconut Milk', 'Medicinal Herbs', 'Spices'],
                spicyLevel: 1,
                isBestSeller: true,
                isAvailable: true,
                isActive: true
            },
            {
                name: 'Mango Pickle',
                slug: 'mango-pickle',
                description: 'Traditional Kerala style raw mango pickle',
                price: 89,
                category: 'appetizer',
                festival: 'vishu',
                image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                calories: 150,
                prepTime: 20,
                serves: 1,
                ingredients: ['Raw Mango', 'Mustard', 'Chili Powder', 'Oil'],
                spicyLevel: 4,
                isBestSeller: false,
                isAvailable: true,
                isActive: true
            }
        ];

        const createdFoodItems = await FoodItem.insertMany(foodItems);
        console.log(`✅ ${createdFoodItems.length} food items created\n`);

        // Create gallery items with CORRECT field names (imageUrl not image)
        console.log('📸 Creating gallery items...');
        const galleryItems = [
            {
                title: "Onam Sadhya Spread",
                description: "Traditional Onam feast served on banana leaf",
                imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                category: "festival",
                featured: true,
                isActive: true,
                uploadedBy: admin._id
            },
            {
                title: "Christmas Feast",
                description: "Kerala style Christmas celebration with traditional dishes",
                imageUrl: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                category: "festival",
                featured: true,
                isActive: true,
                uploadedBy: admin._id
            },
            {
                title: "Traditional Cooking",
                description: "Authentic Kerala style cooking in clay pots",
                imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                category: "kitchen",
                featured: true,
                isActive: true,
                uploadedBy: admin._id
            },
            {
                title: "Banana Leaf Serving",
                description: "Traditional serving on banana leaf",
                imageUrl: "https://images.unsplash.com/photo-1567188040759-8c8916b4e6f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                category: "food",
                featured: false,
                isActive: true,
                uploadedBy: admin._id
            },
            {
                title: "Kerala Fish Curry",
                description: "Traditional fish curry preparation",
                imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                category: "food",
                featured: false,
                isActive: true,
                uploadedBy: admin._id
            },
            {
                title: "Chef Preparing Meal",
                description: "Expert chef preparing traditional Kerala meal",
                imageUrl: "https://images.unsplash.com/photo-1585937421612-70ca003675ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                category: "chef",
                featured: true,
                isActive: true,
                uploadedBy: admin._id
            }
        ];

        const createdGallery = await Gallery.insertMany(galleryItems);
        console.log(`✅ ${createdGallery.length} gallery items created\n`);

        // Create a test user
        console.log('👤 Creating test user...');
        const testUser = await User.create({
            name: 'Test User',
            email: 'user@example.com',
            phone: '9876543210',
            password: 'User@123',
            role: 'user'
        });
        console.log(`✅ Test user created: ${testUser.email}\n`);

       // Summary section (around line 250)
console.log('📊 ===== SEEDING COMPLETE =====');
console.log('📋 Database Summary:');
console.log(`   👑 Admin: ${adminEmail}`);
console.log(`   👤 Test User: user@example.com (password: User@123)`);
console.log(`   🎉 Festivals: ${createdFestivals.length}`);
console.log(`   🍛 Food Items: ${createdFoodItems.length}`);
console.log(`   📸 Gallery Items: ${createdGallery.length}`);

console.log('\n🌐 Test API Endpoints:');
console.log('   GET  http://localhost:5000/api/festivals');
console.log('   GET  http://localhost:5000/api/food');
console.log('   GET  http://localhost:5000/api/festival/onam');
console.log('   GET  http://localhost:5000/api/festival/christmas');
console.log('   GET  http://localhost:5000/api/festival/vishu');
console.log('   POST http://localhost:5000/api/admin/login');

console.log('\n🔑 Admin Login:');
console.log(`   Email: ${adminEmail}`);
console.log('   Password: [From .env file - securely stored]'); // DON'T SHOW PASSWORD

console.log('\n👤 Test User Login:');
console.log('   Email: user@example.com');
console.log('   Password: User@123');

console.log('\n🎉 Database is now ready with real data!');
console.log('\n💡 Next: Start your backend server and test the APIs.');

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ SEEDING FAILED:', error.message);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`   - ${key}: ${error.errors[key].message}`);
            });
        }
        console.error('\n💡 Error details:', error);
        mongoose.connection.close();
        process.exit(1);
    }
};

seedData();