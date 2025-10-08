const Product = require("../models/productModel");
const { uploadImageToCloudinary } = require("../config/imageUploader");
const fs = require('fs');

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            originalPrice,
            category,
            industry,
            size,
            inStock,
            featured,
            seoTitle,
            seoDescription,
            seoKeywords,
            specifications,
            tags
        } = req.body;

        // Handle image uploads
        let imageUrls = [];
        if (req.files && req.files.images) {
            const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            
            for (const file of files) {
                const uploadedImage = await uploadImageToCloudinary(file, process.env.FOLDER_NAME);
                imageUrls.push(uploadedImage.secure_url);
                // Clean up temp file
                if (file.tempFilePath) {
                    fs.unlinkSync(file.tempFilePath);
                }
            }
        }

        // Parse JSON strings if they exist
        const parsedSpecifications = specifications ? JSON.parse(specifications) : [];
        const parsedTags = tags ? JSON.parse(tags) : [];
        const parsedSeoKeywords = seoKeywords ? JSON.parse(seoKeywords) : [];

        // Calculate discount percentage
        const discountPercentage = originalPrice && price ? 
            Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
        const discount = discountPercentage > 0 ? `${discountPercentage}% OFF` : "0% OFF";

        const product = new Product({
            name,
            description,
            price: parseFloat(price),
            originalPrice: parseFloat(originalPrice),
            discount,
            category,
            industry,
            size,
            images: imageUrls,
            inStock: inStock === 'true',
            featured: featured === 'true',
            seoTitle,
            seoDescription,
            seoKeywords: parsedSeoKeywords,
            specifications: parsedSpecifications,
            tags: parsedTags
        });

        const savedProduct = await product.save();

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: savedProduct
        });

    } catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: error.message
        });
    }
};

// Get all products with filtering and pagination
exports.getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            industry,
            featured,
            inStock,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = { isActive: true };
        
        // Fix undefined string values
        if (category && category !== 'All' && category !== 'undefined') filter.category = category;
        if (industry && industry !== 'All' && industry !== 'undefined') filter.industry = industry;
        if (featured !== undefined && featured !== 'undefined') filter.featured = featured === 'true';
        if (inStock !== undefined && inStock !== 'undefined') filter.inStock = inStock === 'true';
        
        // Text search - only if search is not undefined string
        if (search && search !== 'undefined') {
            filter.$text = { $search: search };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(filter);

        res.status(200).json({
            success: true,
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalProducts: total,
                hasNext: skip + parseInt(limit) < total,
                hasPrev: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message
        });
    }
};

// Get single product by ID or slug
exports.getProduct = async (req, res) => {
    try {
        const { identifier } = req.params;
        
        // Try to find by ID first, then by slug
        let product = await Product.findById(identifier);
        if (!product) {
            product = await Product.findOne({ slug: identifier, isActive: true });
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Increment view count
        product.views += 1;
        await product.save();

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch product",
            error: error.message
        });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Handle new image uploads
        if (req.files && req.files.images) {
            const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            const newImageUrls = [];
            
            for (const file of files) {
                const uploadedImage = await uploadImageToCloudinary(file, process.env.FOLDER_NAME);
                newImageUrls.push(uploadedImage.secure_url);
                // Clean up temp file
                if (file.tempFilePath) {
                    fs.unlinkSync(file.tempFilePath);
                }
            }
            
            // Add new images to existing ones or replace them
            if (updateData.replaceImages === 'true') {
                updateData.images = newImageUrls;
            } else {
                const existingProduct = await Product.findById(id);
                updateData.images = [...(existingProduct.images || []), ...newImageUrls];
            }
        }

        // Parse JSON strings if they exist
        if (updateData.specifications) {
            updateData.specifications = JSON.parse(updateData.specifications);
        }
        if (updateData.tags) {
            updateData.tags = JSON.parse(updateData.tags);
        }
        if (updateData.seoKeywords) {
            updateData.seoKeywords = JSON.parse(updateData.seoKeywords);
        }

        // Convert string booleans
        if (updateData.inStock !== undefined) {
            updateData.inStock = updateData.inStock === 'true';
        }
        if (updateData.featured !== undefined) {
            updateData.featured = updateData.featured === 'true';
        }

        // Recalculate discount if prices changed
        if (updateData.price || updateData.originalPrice) {
            const product = await Product.findById(id);
            const newPrice = updateData.price ? parseFloat(updateData.price) : product.price;
            const newOriginalPrice = updateData.originalPrice ? parseFloat(updateData.originalPrice) : product.originalPrice;
            
            const discountPercentage = newOriginalPrice && newPrice ? 
                Math.round(((newOriginalPrice - newPrice) / newOriginalPrice) * 100) : 0;
            updateData.discount = discountPercentage > 0 ? `${discountPercentage}% OFF` : "0% OFF";
        }

        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update product",
            error: error.message
        });
    }
};

// Delete product (soft delete)
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: error.message
        });
    }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 6 } = req.query;

        const products = await Product.find({
            featured: true,
            isActive: true,
            inStock: true
        })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        console.error("Get featured products error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch featured products",
            error: error.message
        });
    }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { limit = 10, page = 1 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find({
            category,
            isActive: true
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        const total = await Product.countDocuments({ category, isActive: true });

        res.status(200).json({
            success: true,
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalProducts: total
            }
        });

    } catch (error) {
        console.error("Get products by category error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products by category",
            error: error.message
        });
    }
};

// Get all categories and industries
exports.getFilters = async (req, res) => {
    try {
        const categories = await Product.distinct('category', { isActive: true });
        const industries = await Product.distinct('industry', { isActive: true });

        res.status(200).json({
            success: true,
            filters: {
                categories,
                industries
            }
        });

    } catch (error) {
        console.error("Get filters error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch filters",
            error: error.message
        });
    }
};