import axios from "axios";

// Product
export const fetchProduct = async () => {
    const response = await axios.get("http://127.0.0.1:3001/productList");
    return response.data;
};

export const searchProducts = async keyword => {
    const response = await axios.get(`http://127.0.0.1:3001/productList?q_like=${keyword}`);
    return response.data;
};

export const addProduct = async data => {
    const response = await axios.post("http://127.0.0.1:3001/productList", data);
    return response;
};
export const deleteProduct = async id => {
    await axios.delete(`http://127.0.0.1:3001/productList/${id}`);
};
export const editProduct = async (id, data) => {
    // Menggunakan PUT untuk mengganti seluruh objek produk dengan ID yang sesuai
    const response = await axios.put(`http://127.0.0.1:3001/productList/${id}`, data);
    return response.data; // Mengembalikan data produk yang terupdate
};

export const updateProductStock = async (id, newProductData) => {
    // Menggunakan axios.put untuk mengganti seluruh objek produk dengan ID yang sesuai
    const response = await axios.put(`http://127.0.0.1:3001/productList/${id}`, newProductData);
    return response.data; // Mengembalikan data produk yang terupdate
};

// Order
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
    // Menggunakan PATCH hanya untuk mengubah field 'status'
    const response = await axios.patch(`http://127.0.0.1:3001/orders/${id}`, {status: newStatus});
    return response.data; // Mengembalikan data order yang terupdate
};

// Transaction Log

export const fetchTransactionLog = async () => {
    // 💡 Mengambil semua data log transaksi
    const response = await axios.get("http://127.0.0.1:3001/transactionLog");
    return response.data;
};

// Transaction Log (Accepted Orders - Permanent Record)
export const createTransactionLog = async data => {
    // 💡 Membuat entry baru di collection 'transactionLog'
    const response = await axios.post("http://127.0.0.1:3001/transactionLog", data);
    return response;
};
