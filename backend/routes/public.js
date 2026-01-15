// routes/public.js - Food Items Route
router.get('/food', async (req, res) => {
  try {
    console.log('Fetching food items...');
    
    // Find all food items, populate festival if needed
    const foodItems = await FoodItem.find({})
      .populate('festival', 'name slug')
      .sort({ category: 1, name: 1 })
      .lean();
    
    console.log(`Found ${foodItems.length} food items`);
    
    res.status(200).json({
      success: true,
      foodItems: foodItems,
      count: foodItems.length
    });
    
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch food items'
    });
  }
});