const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
        },
        originalPrice: {
            type: Number,
            required: true,
        },
        discount: {
            type: String,
            default: "0% OFF",
        },
        category: {
            type: String,
            required: true,
            enum: ["Flex Banners", "LED Signage", "Vinyl Stickers", "Acrylic Boards", "Digital Displays", "Banner Stands", "Roll-up Banners", "Other"],
        },
        industry: {
            type: String,
            required: true,
            enum: ["Healthcare", "Real Estate", "Fashion", "Automotive", "Business", "Retail", "Construction", "Financial Services", "Multi-Industry", "Other"],
        },
        size: {
            type: String,
            required: true,
        },
        images: [{
            type: String, // Cloudinary URLs
            required: true,
        }],
        inStock: {
            type: Boolean,
            default: true,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        // SEO Fields
        seoTitle: {
            type: String,
            trim: true,
        },
        seoDescription: {
            type: String,
            trim: true,
        },
        seoKeywords: [{
            type: String,
            trim: true,
        }],
        slug: {
            type: String,
            unique: true,
            trim: true,
        },
        metaTags: {
            ogTitle: {
                type: String,
                trim: true,
            },
            ogDescription: {
                type: String,
                trim: true,
            },
            ogImage: {
                type: String, // Cloudinary URL
            },
        },
        // Additional product details
        specifications: [{
            key: {
                type: String,
                trim: true,
            },
            value: {
                type: String,
                trim: true,
            },
        }],
        tags: [{
            type: String,
            trim: true,
        }],
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Create slug from name before saving
productSchema.pre('save', function(next) {
    if (this.isModified('name') || this.isNew) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    
    // Initialize metaTags if not exists
    if (!this.metaTags) {
        this.metaTags = {};
    }
    
    // Auto-generate SEO fields if not provided
    if (!this.seoTitle) {
        this.seoTitle = this.name;
    }
    if (!this.seoDescription) {
        this.seoDescription = this.description;
    }
    if (!this.metaTags.ogTitle) {
        this.metaTags.ogTitle = this.name;
    }
    if (!this.metaTags.ogDescription) {
        this.metaTags.ogDescription = this.description;
    }
    if (!this.metaTags.ogImage && this.images && this.images.length > 0) {
        this.metaTags.ogImage = this.images[0];
    }
    
    next();
});

// Virtual for discount percentage calculation
productSchema.virtual('discountPercentage').get(function() {
    if (this.originalPrice && this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', seoKeywords: 'text' });
productSchema.index({ category: 1, industry: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ featured: 1, isActive: 1 });

module.exports = mongoose.model("Product", productSchema);