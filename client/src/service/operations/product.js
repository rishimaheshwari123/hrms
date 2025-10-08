import { apiConnector } from "../apiConnector";
import { products } from "../apis";
import { toast } from 'react-toastify';

const {
    GET_ALL_PRODUCTS,
    GET_FEATURED_PRODUCTS,
    GET_PRODUCT,
    CREATE_PRODUCT,
    UPDATE_PRODUCT,
    DELETE_PRODUCT,
    GET_FILTERS,
    GET_BY_CATEGORY
} = products;

// Get all products with filtering and pagination
export const getAllProducts = async (filters = {}) => {
    let result = [];
    const toastId = toast.loading("Loading products...");
    
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const url = queryParams ? `${GET_ALL_PRODUCTS}?${queryParams}` : GET_ALL_PRODUCTS;
        
        const response = await apiConnector("GET", url);
        
        if (!response?.data?.success) {
            throw new Error("Could not fetch products");
        }
        
        result = response.data;
        toast.success("Products loaded successfully");
        
    } catch (error) {
        console.log("GET ALL PRODUCTS API ERROR............", error);
        toast.error(error.message || "Failed to load products");
    }
    
    toast.dismiss(toastId);
    return result;
};

// Get featured products
export const getFeaturedProducts = async (limit = 6) => {
    let result = [];
    
    try {
        console.log('Calling featured products API...');
        const response = await apiConnector("GET", `${GET_FEATURED_PRODUCTS}?limit=${limit}`);
        console.log('Featured products API response:', response);
        
        if (!response?.data?.success) {
            throw new Error("Could not fetch featured products");
        }
        
        result = response.data.products;
        console.log('Featured products result:', result);
        
    } catch (error) {
        console.log("GET FEATURED PRODUCTS API ERROR............", error);
        toast.error(error.message || "Failed to load featured products");
    }
    
    return result;
};

// Get single product by ID or slug
export const getProduct = async (identifier) => {
    let result = null;
    const toastId = toast.loading("Loading product...");
    
    try {
        const response = await apiConnector("GET", `${GET_PRODUCT}/${identifier}`);
        
        if (!response?.data?.success) {
            throw new Error("Product not found");
        }
        
        result = response.data.product;
        toast.success("Product loaded successfully");
        
    } catch (error) {
        console.log("GET PRODUCT API ERROR............", error);
        toast.error(error.message || "Failed to load product");
    }
    
    toast.dismiss(toastId);
    return result;
};

// Get single product by slug
export const getProductBySlug = async (slug) => {
    let result = null;
    
    try {
        console.log('Fetching product by slug:', slug);
        const response = await apiConnector("GET", `${GET_PRODUCT}/${slug}`);
        console.log('Product by slug response:', response);
        
        if (!response?.data?.success) {
            throw new Error("Product not found");
        }
        
        result = response.data;
        
    } catch (error) {
        console.log("GET PRODUCT BY SLUG API ERROR............", error);
        throw error;
    }
    
    return result;
};

// Create new product (Admin only)
export const createProduct = async (productData, token) => {
    let result = null;
    const toastId = toast.loading("Creating product...");
    
    try {
        const formData = new FormData();
        
        // Add all product fields to FormData
        Object.keys(productData).forEach(key => {
            if (key === 'images') {
                // Handle multiple images
                if (productData[key] && productData[key].length > 0) {
                    for (let i = 0; i < productData[key].length; i++) {
                        formData.append('images', productData[key][i]);
                    }
                }
            } else if (key === 'specifications' || key === 'tags' || key === 'seoKeywords') {
                // Convert arrays/objects to JSON strings
                formData.append(key, JSON.stringify(productData[key]));
            } else {
                formData.append(key, productData[key]);
            }
        });
        
        const response = await apiConnector("POST", CREATE_PRODUCT, formData, {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        });
        
        if (!response?.data?.success) {
            throw new Error("Could not create product");
        }
        
        result = response.data.product;
        toast.success("Product created successfully");
        
    } catch (error) {
        console.log("CREATE PRODUCT API ERROR............", error);
        toast.error(error.message || "Failed to create product");
    }
    
    toast.dismiss(toastId);
    return result;
};

// Update product (Admin only)
export const updateProduct = async (productId, productData, token) => {
    let result = null;
    const toastId = toast.loading("Updating product...");
    
    try {
        const formData = new FormData();
        
        // Add all product fields to FormData
        Object.keys(productData).forEach(key => {
            if (key === 'images') {
                // Handle multiple images
                if (productData[key] && productData[key].length > 0) {
                    for (let i = 0; i < productData[key].length; i++) {
                        formData.append('images', productData[key][i]);
                    }
                }
            } else if (key === 'specifications' || key === 'tags' || key === 'seoKeywords') {
                // Convert arrays/objects to JSON strings
                formData.append(key, JSON.stringify(productData[key]));
            } else {
                formData.append(key, productData[key]);
            }
        });
        
        const response = await apiConnector("PUT", `${UPDATE_PRODUCT}/${productId}`, formData, {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        });
        
        if (!response?.data?.success) {
            throw new Error("Could not update product");
        }
        
        result = response.data.product;
        toast.success("Product updated successfully");
        
    } catch (error) {
        console.log("UPDATE PRODUCT API ERROR............", error);
        toast.error(error.message || "Failed to update product");
    }
    
    toast.dismiss(toastId);
    return result;
};

// Delete product (Admin only)
export const deleteProduct = async (productId, token) => {
    let result = false;
    const toastId = toast.loading("Deleting product...");
    
    try {
        const response = await apiConnector("DELETE", `${DELETE_PRODUCT}/${productId}`, null, {
            Authorization: `Bearer ${token}`,
        });
        
        if (!response?.data?.success) {
            throw new Error("Could not delete product");
        }
        
        result = true;
        toast.success("Product deleted successfully");
        
    } catch (error) {
        console.log("DELETE PRODUCT API ERROR............", error);
        toast.error(error.message || "Failed to delete product");
    }
    
    toast.dismiss(toastId);
    return result;
};

// Get products by category
export const getProductsByCategory = async (category, page = 1, limit = 10) => {
    let result = [];
    
    try {
        const response = await apiConnector("GET", `${GET_BY_CATEGORY}/${category}?page=${page}&limit=${limit}`);
        
        if (!response?.data?.success) {
            throw new Error("Could not fetch products by category");
        }
        
        result = response.data;
        
    } catch (error) {
        console.log("GET PRODUCTS BY CATEGORY API ERROR............", error);
        toast.error(error.message || "Failed to load products");
    }
    
    return result;
};

// Get filter options (categories and industries)
export const getFilters = async () => {
    let result = { categories: [], industries: [] };
    
    try {
        const response = await apiConnector("GET", GET_FILTERS);
        
        if (!response?.data?.success) {
            throw new Error("Could not fetch filters");
        }
        
        result = response.data.filters;
        
    } catch (error) {
        console.log("GET FILTERS API ERROR............", error);
        // Don't show toast for filters as it's not critical
    }
    
    return result;
};