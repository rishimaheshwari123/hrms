const mongoose = require('mongoose');
const Product = require('./models/productModel');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB Cloud successfully!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample product data
const sampleProducts = [
  {
    name: "Premium Flex Banner - Healthcare",
    description: "High-quality flex banner perfect for healthcare advertising with vibrant colors and weather-resistant material.",
    price: 2999,
    originalPrice: 3999,
    discount: "25% OFF",
    category: "Flex Banners",
    industry: "Healthcare",
    size: "10x6 feet",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500"
    ],
    inStock: true,
    featured: true,
    seoTitle: "Premium Healthcare Flex Banner - Professional Medical Advertising",
    seoDescription: "High-quality flex banners designed specifically for healthcare advertising with vibrant colors and durability.",
    seoKeywords: ["flex banner", "healthcare", "medical advertising", "outdoor banner"],
    specifications: [
      { key: "Material", value: "Premium Flex" },
      { key: "Print Quality", value: "HD Digital Print" },
      { key: "Weather Resistance", value: "UV Protected" },
      { key: "Installation", value: "Eyelets Included" }
    ],
    tags: ["healthcare", "flex banner", "advertising", "outdoor"],
    rating: 4.5,
    reviewCount: 128,
    isActive: true
  },
  {
    name: "LED Signage Display - Real Estate",
    description: "Bright LED signage perfect for real estate promotions with programmable display and energy-efficient design.",
    price: 15999,
    originalPrice: 19999,
    discount: "20% OFF",
    category: "LED Signage",
    industry: "Real Estate",
    size: "4x2 feet",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500"
    ],
    inStock: true,
    featured: true,
    seoTitle: "LED Signage for Real Estate - Bright Digital Display",
    seoDescription: "Professional LED signage solutions for real estate marketing with programmable displays and energy efficiency.",
    seoKeywords: ["LED signage", "real estate", "digital display", "property marketing"],
    specifications: [
      { key: "Display Type", value: "Full Color LED" },
      { key: "Brightness", value: "5000 nits" },
      { key: "Power Consumption", value: "Low Energy" },
      { key: "Control", value: "WiFi/USB Programmable" }
    ],
    tags: ["LED", "real estate", "digital signage", "advertising"],
    rating: 4.3,
    reviewCount: 89,
    isActive: true
  },
  {
    name: "Vinyl Stickers - Fashion Brand",
    description: "Premium vinyl stickers for fashion brand promotion with glossy finish and strong adhesive backing.",
    price: 899,
    originalPrice: 1299,
    discount: "30% OFF",
    category: "Vinyl Stickers",
    industry: "Fashion",
    size: "Custom Sizes Available",
    images: [
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500"
    ],
    inStock: true,
    featured: false,
    seoTitle: "Fashion Brand Vinyl Stickers - Premium Quality",
    seoDescription: "High-quality vinyl stickers perfect for fashion brand promotion with glossy finish and durability.",
    seoKeywords: ["vinyl stickers", "fashion", "brand promotion", "custom stickers"],
    specifications: [
      { key: "Material", value: "Premium Vinyl" },
      { key: "Finish", value: "Glossy/Matte Options" },
      { key: "Adhesive", value: "Strong Permanent" },
      { key: "Cutting", value: "Die-Cut Available" }
    ],
    tags: ["vinyl", "fashion", "stickers", "branding"],
    rating: 4.8,
    reviewCount: 45,
    isActive: true
  },
  {
    name: "Acrylic Board - Automotive Showroom",
    description: "Crystal clear acrylic boards perfect for automotive showroom displays with professional finish and durability.",
    price: 3499,
    originalPrice: 4499,
    discount: "22% OFF",
    category: "Acrylic Boards",
    industry: "Automotive",
    size: "3x2 feet",
    images: [
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"
    ],
    inStock: true,
    featured: true,
    seoTitle: "Automotive Acrylic Display Boards - Professional Showroom",
    seoDescription: "Premium acrylic boards designed for automotive showrooms with crystal clarity and professional appearance.",
    seoKeywords: ["acrylic boards", "automotive", "showroom display", "clear boards"],
    specifications: [
      { key: "Material", value: "Cast Acrylic" },
      { key: "Thickness", value: "5mm/8mm Options" },
      { key: "Clarity", value: "Crystal Clear" },
      { key: "Mounting", value: "Wall/Stand Options" }
    ],
    tags: ["acrylic", "automotive", "showroom", "display"],
    rating: 4.6,
    reviewCount: 156,
    isActive: true
  },
  {
    name: "Digital Display Screen - Business",
    description: "Interactive digital display screen perfect for business presentations and customer engagement.",
    price: 25999,
    originalPrice: 32999,
    discount: "21% OFF",
    category: "Digital Displays",
    industry: "Business",
    size: "55 inch",
    images: [
      "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=500",
      "https://images.unsplash.com/photo-1609592806787-3d9c1b8e5e8e?w=500"
    ],
    inStock: true,
    featured: false,
    seoTitle: "Business Digital Display Screen - Interactive Solutions",
    seoDescription: "Professional digital display screens for business use with interactive features and high resolution.",
    seoKeywords: ["digital display", "business", "interactive screen", "presentation"],
    specifications: [
      { key: "Screen Size", value: "55 inch 4K" },
      { key: "Touch", value: "Multi-touch Capable" },
      { key: "Connectivity", value: "HDMI, USB, WiFi" },
      { key: "Software", value: "Content Management Included" }
    ],
    tags: ["digital", "business", "interactive", "display"],
    rating: 4.2,
    reviewCount: 73,
    isActive: true
  },
  {
    name: "Banner Stand - Retail Promotion",
    description: "Portable banner stand perfect for retail promotions with easy setup and professional appearance.",
    price: 1999,
    originalPrice: 2999,
    discount: "33% OFF",
    category: "Banner Stands",
    industry: "Retail",
    size: "6x3 feet",
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500"
    ],
    inStock: true,
    featured: true,
    seoTitle: "Retail Banner Stand - Portable Display Solution",
    seoDescription: "Professional banner stands for retail promotions with easy setup and eye-catching displays.",
    seoKeywords: ["banner stand", "retail", "portable display", "promotion"],
    specifications: [
      { key: "Setup Time", value: "Under 2 minutes" },
      { key: "Material", value: "Aluminum Frame" },
      { key: "Banner", value: "Premium Print Included" },
      { key: "Portability", value: "Carrying Case Included" }
    ],
    tags: ["banner", "retail", "portable", "promotion"],
    rating: 4.4,
    reviewCount: 92,
    isActive: true
  },
  {
    name: "Roll-up Banner - Construction",
    description: "Durable roll-up banner designed for construction industry with weather-resistant materials.",
    price: 1499,
    originalPrice: 1999,
    discount: "25% OFF",
    category: "Roll-up Banners",
    industry: "Construction",
    size: "5x3 feet",
    images: [
      "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"
    ],
    inStock: false,
    featured: false,
    seoTitle: "Construction Roll-up Banner - Durable Outdoor Display",
    seoDescription: "Heavy-duty roll-up banners for construction industry with weather-resistant materials and durability.",
    seoKeywords: ["roll-up banner", "construction", "outdoor display", "durable"],
    specifications: [
      { key: "Material", value: "Heavy-duty Vinyl" },
      { key: "Weather Resistance", value: "Waterproof" },
      { key: "Mechanism", value: "Spring-loaded" },
      { key: "Base", value: "Weighted Aluminum" }
    ],
    tags: ["roll-up", "construction", "outdoor", "durable"],
    rating: 4.1,
    reviewCount: 34,
    isActive: true
  },
  {
    name: "Custom Signage Solution - Financial Services",
    description: "Premium custom signage solution for financial services with elegant design and professional finish.",
    price: 8999,
    originalPrice: 12999,
    discount: "31% OFF",
    category: "Other",
    industry: "Financial Services",
    size: "Custom Design",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
      "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500"
    ],
    inStock: true,
    featured: true,
    seoTitle: "Financial Services Custom Signage - Professional Solutions",
    seoDescription: "Elegant custom signage solutions for financial services with premium materials and professional design.",
    seoKeywords: ["custom signage", "financial services", "professional", "elegant design"],
    specifications: [
      { key: "Design", value: "Custom Professional" },
      { key: "Materials", value: "Premium Mixed Media" },
      { key: "Installation", value: "Professional Service" },
      { key: "Warranty", value: "2 Years Coverage" }
    ],
    tags: ["custom", "financial", "professional", "signage"],
    rating: 4.7,
    reviewCount: 67,
    isActive: true
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Existing products cleared');
    
    // Insert sample products one by one to handle unique constraints
    console.log('Inserting sample products...');
    for (let i = 0; i < sampleProducts.length; i++) {
      try {
        const productData = { ...sampleProducts[i] };
        // Ensure unique slug by adding index if needed
        if (i > 0) {
          productData.slug = productData.name
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') + '-' + (i + 1);
        }
        
        const product = new Product(productData);
        await product.save();
        console.log(`✓ Inserted: ${product.name} (slug: ${product.slug})`);
      } catch (error) {
        console.error(`✗ Failed to insert product ${i + 1}:`, error.message);
        console.error('Full error:', error);
      }
    }
    
    const totalProducts = await Product.countDocuments();
    console.log(`\n🎉 Database seeded successfully!`);
    console.log(`📊 Total products in database: ${totalProducts}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();