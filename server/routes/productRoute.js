const express = require("express");
const router = express.Router();

const {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts,
    getProductsByCategory,
    getFilters
} = require("../controllers/productCtrl");

// Public routes
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/filters", getFilters);
router.get("/category/:category", getProductsByCategory);
router.get("/:identifier", getProduct); // Can be ID or slug

// Admin routes (you can add authentication middleware here)
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;