import axios from "axios";
import {getRoleFromToken} from "../utils/getRoleFromToken";

// Helper: Ambil role dari token
const getApiRole = () => {
    return getRoleFromToken() || "marketing";
};

// Product
export const fetchProduct = async () => {
    const role = getApiRole();
    const response = await axios.get(`http://127.0.0.1:3001/productList?role=${role}`);
    return response.data;
};

export const searchProducts = async keyword => {
    const role = getApiRole();
    const response = await axios.get(`http://127.0.0.1:3001/productList?q_like=${keyword}&role=${role}`);
    return response.data;
};

export const addProduct = async data => {
    const role = getApiRole();
    const response = await axios.post(`http://127.0.0.1:3001/productList?role=${role}`, data);
    return response;
};

export const deleteProduct = async id => {
    const role = getApiRole();
    await axios.delete(`http://127.0.0.1:3001/productList/${id}?role=${role}`);
};

export const editProduct = async (id, data) => {
    const role = getApiRole();
    console.log("🔵 [API] editProduct called");
    console.log("  - ID:", id);
    console.log("  - Role:", role);
    console.log("  - Data being sent:", data);

    try {
        const response = await axios.put(`http://127.0.0.1:3001/productList/${id}?role=${role}`, data);

        console.log("🟢 [API] editProduct response:", response.data);
        return response.data;
    } catch (error) {
        console.error("🔴 [API] editProduct error:", error);
        throw error;
    }
};

export const updateProductStock = async (id, newProductData) => {
    const role = getApiRole();
    const response = await axios.put(`http://127.0.0.1:3001/productList/${id}?role=${role}`, newProductData);
    return response.data;
};

// Order, Revenue, dll - (tidak berubah, copy dari sebelumnya)
export const fetchOrderProduct = async () => {
    const response = await axios.get("http://127.0.0.1:3001/orders");
    return response.data;
};

export const addOrder = async data => {
    const response = await axios.post("http://127.0.0.1:3001/orders", data);
    return response;
};

export const searchOrderProducts = async keyword => {
    const response = await axios.get(`http://127.0.0.1:3001/orders?q_like=${keyword}`);
    return response.data;
};

export const deleteOrderProduct = async id => {
    await axios.delete(`http://127.0.0.1:3001/orders/${id}`);
};

export const editOrderProduct = async (id, data) => {
    const response = await axios.patch(`http://127.0.0.1:3001/orders/${id}`, data);
    return response.data;
};

export const updateOrderStatus = async (id, newStatus) => {
    const response = await axios.patch(`http://127.0.0.1:3001/orders/${id}`, {status: newStatus});
    return response.data;
};

export const fetchTransactionLog = async () => {
    const response = await axios.get("http://127.0.0.1:3001/transactionLog");
    return response.data;
};

export const createTransactionLog = async data => {
    const response = await axios.post("http://127.0.0.1:3001/transactionLog", data);
    return response;
};

// ============ PRODUCT HISTORY OPERATIONS ============

export const fetchProductHistory = async () => {
    const response = await axios.get("http://127.0.0.1:3001/productHistory");
    return response.data;
};

export const addProductHistory = async data => {
    const response = await axios.post("http://127.0.0.1:3001/productHistory", data);
    return response;
};

export const deleteProductHistory = async id => {
    await axios.delete(`http://127.0.0.1:3001/productHistory/${id}`);
};
