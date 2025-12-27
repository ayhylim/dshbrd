import axios from "axios";

const PRODUCT_HISTORY_API = "http://127.0.0.1:3001/productHistory";

// GET all product history
export const fetchProductHistory = async () => {
    try {
        const response = await axios.get(PRODUCT_HISTORY_API);
        return response.data;
    } catch (error) {
        console.error("Error fetching product history:", error);
        throw error;
    }
};

// GET single product history by productId
export const getProductHistoryByProductId = async productId => {
    try {
        const response = await axios.get(`${PRODUCT_HISTORY_API}/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching product history:", error);
        throw error;
    }
};

// POST - Create product history entry
export const createProductHistory = async historyData => {
    try {
        const response = await axios.post(PRODUCT_HISTORY_API, historyData);
        return response.data;
    } catch (error) {
        console.error("Error creating product history:", error);
        throw error;
    }
};

// DELETE - Delete product history by productId
export const deleteProductHistory = async productId => {
    try {
        const response = await axios.delete(`${PRODUCT_HISTORY_API}/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting product history:", error);
        throw error;
    }
};

export default {
    fetchProductHistory,
    getProductHistoryByProductId,
    createProductHistory,
    deleteProductHistory
};
