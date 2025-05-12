const mongoose = require('mongoose');
require('dotenv').config();

// Categories to seed
const categories = [
  {
    name: 'Vegetables',
    slug: 'vegetables',
    description: 'Fresh vegetables directly from farms.',
  },
  {
    name: 'Fruits',
    slug: 'fruits',
    description: 'Fresh fruits of all varieties.',
  },
  {
    name: 'Dairy',
    slug: 'dairy',
    description: 'Fresh dairy products including milk, cheese and yogurt.',
  },
  {
    name: 'Eggs',
    slug: 'eggs',
    description: 'Farm fresh eggs from free-range chickens.',
  },
  {
    name: 'Meat',
    slug: 'meat',
    description: 'Farm raised meats, including beef, chicken, pork and more.',
  },
  {
    name: 'Herbs',
    slug: 'herbs',
    description: 'Fresh culinary and medicinal herbs.',
  },
  {
    name: 'Honey',
    slug: 'honey',
    description: 'Local honey and bee products.',
  },
  {
    name: 'Bakery',
    slug: 'bakery',
    description: 'Fresh baked goods made with farm ingredients.',
  },
  {
    name: 'Processed',
    slug: 'processed',
    description: 'Jams, preserves, pickles and other processed farm goods.',
  },
  {
    name: 'Other',
    slug: 'other',
    description: 'Other farm products that don\'t fit in the above categories.',
  },
];

// Define Category schema
const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  imageUrl: String,
});

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/farmer-harvest-connect");
    console.log('Connected to MongoDB');
    
    // Get Category model
    const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
    
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');
    
    // Insert new categories
    const result = await Category.insertMany(categories);
    console.log(`${result.length} categories created`);
    
    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCategories();