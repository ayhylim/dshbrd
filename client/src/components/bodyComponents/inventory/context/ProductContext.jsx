// #ProductContext.jsx (FINAL FIX: Hapus Logika Customer yang Belum Ada API-nya)

import {createContext, useState, useCallback} from "react";
import {
    addProduct,
    fetchProduct,
    addOrder,
    fetchOrderProduct,
    updateProductStock,
    editProduct,
    editOrderProduct,
    deleteOrderProduct,
    createTransactionLog,
    fetchTransactionLog
    // TIDAK ADA API CUSTOMER DI api.jsx ANDA, MAKA KITA HAPUS IMPORT INI
    // updateCustomerAPI,
    // createCustomerAPI
} from "../../../../api/api";

const ProductContext = createContext();

function Provider({children}) {
    const [product, setProduct] = useState([]);
    const [order, setOrder] = useState([]);
    const [transactionLog, setTransactionLog] = useState([]);

    // HAPUS/KOMENTARI STATE CUSTOMER KARENA TIDAK ADA API PENDUKUNGNYA
    const [customers, setCustomers] = useState([]);

    // --- Product ---
    const fetchDataAPI = useCallback(async () => {
        try {
            const res = await fetchProduct();
            setProduct(res);
        } catch (error) {
            console.error("Gagal mengambil data produk:", error);
        }
    }, []);

    const onCreateProduct = async data => {
        try {
            const res = await addProduct(data);
            setProduct(prev => [...prev, res.data]);
        } catch (error) {
            console.error("Gagal membuat produk:", error);
            throw error;
        }
    };

    // Untuk edit product
    const onEditProduct = async (id, updatedData) => {
        try {
            const res = await editProduct(id, updatedData);
            setProduct(prev => prev.map(p => (p.id === id ? res : p)));
            return res;
        } catch (error) {
            console.error("Gagal mengedit produk:", error);
            throw error;
        }
    };

    // --- Order (Status: Pending) ---
    const fetchDataOrderAPI = useCallback(async () => {
        try {
            const res = await fetchOrderProduct();
            setOrder(res);
        } catch (error) {
            console.error("Gagal mengambil data order:", error);
        }
    }, []);

    // --- Transaction Log (Status: Accepted) ---
    const fetchTransactionLogAPI = useCallback(async () => {
        try {
            const res = await fetchTransactionLog();
            setTransactionLog(res);
        } catch (error) {
            console.error("Gagal mengambil log transaksi:", error);
        }
    }, []);

    // FUNGSI UTILITY (get stock)
    const getProductStock = productName => {
        const targetProduct = product.find(p => p.productName === productName);
        return targetProduct ? Number(targetProduct.stock) : 0;
    };

    const onCreateOrderProduct = async data => {
        const newOrderWithStatus = {...data, status: "Pending", dateCreated: new Date().toISOString()};
        const productsToProcess = newOrderWithStatus.products;

        // Cek stok awal sebelum loop untuk penanganan error yang lebih baik
        for (const newOrderProduct of productsToProcess) {
            const productName = newOrderProduct.productName;
            const orderedAmount = Number(newOrderProduct.productAmount);
            const targetProduct = product.find(p => p.productName === productName);

            if (!targetProduct || Number(targetProduct.stock) < orderedAmount) {
                throw new Error(
                    `Stok ${productName} (${
                        targetProduct?.stock || 0
                    }) tidak mencukupi untuk order sebanyak ${orderedAmount}.`
                );
            }
        }

        // 2. Potong stok untuk SEMUA produk (Stok dipotong saat Pending)
        const updateStockPromises = [];

        for (const newOrderProduct of productsToProcess) {
            const productName = newOrderProduct.productName;
            const orderedAmount = Number(newOrderProduct.productAmount);
            const targetProduct = product.find(p => p.productName === productName);

            const newStock = Number(targetProduct.stock) - orderedAmount;

            const updatedProductData = {
                ...targetProduct,
                stock: newStock // Stok sudah dikurangi
            };

            // Simpan promise update stok
            updateStockPromises.push(
                updateProductStock(targetProduct.id, updatedProductData).then(updatedServerProduct => ({
                    id: targetProduct.id,
                    updatedProduct: updatedServerProduct
                }))
            );
        }

        try {
            // Tunggu semua update stok selesai
            const updatedProductsResults = await Promise.all(updateStockPromises);

            // Update State Product di context setelah semua stok berhasil di-update
            setProduct(prev => {
                let newState = [...prev];
                updatedProductsResults.forEach(({id, updatedProduct}) => {
                    newState = newState.map(p => (p.id === id ? updatedProduct : p));
                });
                return newState;
            });

            // 3. Simpan order baru (dengan status Pending)
            const res = await addOrder(newOrderWithStatus);
            setOrder(prev => [...prev, res.data]);
            return res.data;
        } catch (error) {
            console.error("Gagal menyimpan order atau memperbarui stok:", error);
            throw new Error(`Transaksi gagal: ${error.message}`);
        }
    };

    const revertStockForOrders = async (orderIds, deleteFromOrderState = true) => {
        const ordersToRevert = order.filter(o => orderIds.includes(o.id));
        const finalStockChanges = {}; // {productName: totalAmountToRevert}

        // 1. Kumpulkan semua total stok yang harus dikembalikan
        ordersToRevert.forEach(targetOrder => {
            targetOrder.products.forEach(item => {
                const productName = item.productName;
                const amount = Number(item.productAmount);
                finalStockChanges[productName] = (finalStockChanges[productName] || 0) + amount;
            });
        });

        const updatePromises = [];

        // 2. Terapkan perubahan ke produk di Server dan kumpulkan Promises
        for (const productName in finalStockChanges) {
            const amountToRevert = finalStockChanges[productName];
            // Temukan produk di state saat ini (bukan prev state)
            const targetProduct = product.find(p => p.productName === productName);

            if (targetProduct) {
                const newStock = Number(targetProduct.stock) + amountToRevert;

                const updatedProductData = {
                    ...targetProduct,
                    stock: newStock
                };

                // Simpan promise update stok ke server
                updatePromises.push(
                    updateProductStock(targetProduct.id, updatedProductData).then(updatedServerProduct => ({
                        id: targetProduct.id,
                        updatedProduct: updatedServerProduct
                    }))
                );
            }
        }

        // 3. Eksekusi semua update stok di Server secara paralel
        const updatedProductsResults = await Promise.all(updatePromises);

        // 4. Update State Product LOKAL sekali
        setProduct(prev => {
            let newState = [...prev];
            updatedProductsResults.forEach(({id, updatedProduct}) => {
                newState = newState.map(p => (p.id === id ? updatedProduct : p));
            });
            return newState;
        });

        // 5. Hapus Order dari Server dan State
        if (deleteFromOrderState) {
            const deletePromises = orderIds.map(id => deleteOrderProduct(id));
            await Promise.all(deletePromises);

            // Update State Order
            setOrder(prev => prev.filter(o => !orderIds.includes(o.id)));
        }

        return true; // Sukses
    };

    // FUNGSI UTAMA: MENGHAPUS ORDER DAN MENGEMBALIKAN STOK (Dipanggil oleh Delete/Decline)
    const deleteOrderAndRevertStock = async orderId => {
        // Panggil fungsi utama dengan array 1 ID
        return revertStockForOrders([orderId]);
    };

    // FUNGSI INI ADALAH INTI LOGIKA BISNIS
    const updateOrderStatusAPI = async (orderId, newStatus) => {
        // PERBAIKAN KRITIS 1: Ambil targetOrder dari state 'order'
        const targetOrder = order.find(o => o.id === orderId);

        if (!targetOrder) {
            throw new Error(`Order ID ${orderId} tidak ditemukan.`);
        }

        if (targetOrder.status === "Accepted") {
            throw new Error(`Order ID ${orderId} sudah berstatus Accepted dan tidak bisa diubah.`);
        }

        if (newStatus === "Declined") {
            await deleteOrderAndRevertStock(orderId);

            // PERBAIKAN: Tambahkan return
            return {...targetOrder, status: "Declined", isDeleted: true};
        } else if (newStatus === "Accepted") {
            // --- LOGIKA ACCEPTED ---

            try {
                // 1. Buat Log Transaksi (Data permanen)
                const acceptedAtTime = new Date().toISOString();
                const transactionData = {
                    ...targetOrder,
                    originalOrderId: targetOrder.id,
                    status: "Accepted",
                    acceptedAt: acceptedAtTime
                };
                await createTransactionLog(transactionData);

                // 2. Update Status Order di Server & State Order (Order tetap di daftar)
                const updatedServerOrder = await editOrderProduct(orderId, {
                    // HANYA kirim field yang berubah (status & acceptedAt) agar lebih aman
                    status: "Accepted",
                    acceptedAt: acceptedAtTime
                });

                // Update State lokal
                setOrder(prev => prev.map(o => (o.id === orderId ? updatedServerOrder : o)));
                setTransactionLog(prev => [...prev, transactionData]);

                // 3. LOGIKA UPDATE DATA CUSTOMER (DIHAPUS KARENA API BELUM ADA)

                // const customerName = targetOrder.customer;
                // const existingCustomer = customers.find(c => c.name === customerName);
                // const orderProducts = targetOrder.products || [];
                // const totalQty = orderProducts.reduce((sum, item) => sum + Number(item.productAmount), 0);
                // ... (seluruh blok if/else update customer dihapus/dikomentari) ...

                return updatedServerOrder;
            } catch (error) {
                console.error("Gagal memproses Accepted atau membuat log transaksi:", error);
                // Jika gagal di sini, order tetap Pending.
                throw new Error(`Gagal memproses Accepted: ${error.message}`);
            }
        } else {
            throw new Error("Status baru tidak valid.");
        }
    };

    // TAMBAHKAN FUNGSI MULTI-DELETE YANG AKAN DIPAKAI DI ORDERS.JSX
    const deleteMultipleOrdersAPI = async orderIds => {
        // Panggil fungsi utama dengan array ID
        return revertStockForOrders(orderIds);
    };

    // TAMBAHKAN FUNGSI BARU UNTUK DI AKSES MULTI-SELECT DELETE DI ORDERS.JSX
    const deleteOrderAndRevertStockAPI = async orderId => {
        return deleteOrderAndRevertStock(orderId);
    };
    // --- Statistik/Laporan (Menggunakan Transaction Log) ---

    // Hitung HANYA dari `transactionLog` (data yang sudah Accepted/Final)
    const getProductDemand = productName => {
        let totalDemand = 0;

        transactionLog.forEach(log => {
            if (log.products) {
                const productItem = log.products.find(p => p.productName === productName);
                if (productItem) {
                    const amount = Number(productItem.productAmount);
                    totalDemand += isNaN(amount) ? 0 : amount;
                }
            }
        });

        return totalDemand;
    };

    // Hitung HANYA dari `transactionLog`
    const calculateTotalRevenue = () => {
        let totalRevenue = 0;

        transactionLog.forEach(log => {
            if (log.products) {
                log.products.forEach(productItem => {
                    const price = Number(productItem.productPrice);
                    const amount = Number(productItem.productAmount);
                    const subtotal = isNaN(price) || isNaN(amount) ? 0 : price * amount;
                    totalRevenue += subtotal;
                });
            }
        });

        return totalRevenue;
    };

    const getRevenueCardData = () => {
        const totalProducts = product.length;
        const totalAcceptedOrders = transactionLog.length; // Log transaksi = Order Selesai

        // Asumsi `customer` adalah field yang unik di log/order
        const uniqueCustomers = new Set(transactionLog.map(o => o.customer)).size;

        // const simulationPercentage = (Math.random() * 5 + 5).toFixed(0);

        return [
            {
                isMoney: false,
                number: String(totalAcceptedOrders),
                // percentage: Number(simulationPercentage),
                upOrDown: totalAcceptedOrders > 100 ? "up" : "down",
                color: totalAcceptedOrders > 100 ? "green" : "red",
                title: "Total Orders (Accepted)", // Perjelas judul
                subTitle: "vs prev year (Simulated)"
            },
            {
                isMoney: false,
                number: String(uniqueCustomers),
                // percentage: Number(simulationPercentage),
                upOrDown: uniqueCustomers > 50 ? "up" : "down",
                color: uniqueCustomers > 50 ? "green" : "red",
                title: "Total Customer",
                subTitle: "vs prev year (Simulated)"
            },
            {
                isMoney: false,
                number: String(totalProducts),
                // percentage: Number(simulationPercentage),
                upOrDown: totalProducts > 500 ? "up" : "down",
                color: totalProducts > 500 ? "green" : "red",
                title: "Total Product",
                subTitle: "vs prev month (Simulated)"
            }
        ];
    };

    // --- Edit Order (Revert Stok Lama + Potong Stok Baru) ---
    const onEditOrderProduct = async (orderId, oldOrder, newOrderData) => {
        try {
            // 1. Tentukan Perbedaan Stok (Stock Revert/Adjust)
            const stockChanges = {}; // {productName: stockDelta}

            // A. Order Lama: Revert/kembalikan stok yang terambil
            if (oldOrder && oldOrder.products) {
                oldOrder.products.forEach(p => {
                    const amount = Number(p.productAmount); // Pastikan Number
                    // Stock harus DITAMBAH kembali
                    stockChanges[p.productName] = (stockChanges[p.productName] || 0) + amount;
                });
            }

            // B. Order Baru: Kurangi stok sesuai permintaan baru
            if (newOrderData && newOrderData.products) {
                newOrderData.products.forEach(p => {
                    const amount = Number(p.productAmount); // Pastikan Number
                    // Stock harus DIKURANGI sesuai permintaan baru
                    stockChanges[p.productName] = (stockChanges[p.productName] || 0) - amount;
                });
            }

            // 2. Terapkan Perubahan Stok ke Product Context dan Server
            const productsToUpdate = Object.keys(stockChanges);
            const updatedProductsPromises = [];

            // Cek stok akhir sebelum update
            for (const productName of productsToUpdate) {
                const delta = stockChanges[productName];
                const targetProduct = product.find(p => p.productName === productName);

                if (targetProduct) {
                    const newStock = Number(targetProduct.stock) + delta;
                    if (newStock < 0) {
                        throw new Error(`Stok ${productName} tidak mencukupi setelah perubahan order.`);
                    }
                }
            }

            // Proses update stok
            productsToUpdate.forEach(productName => {
                const delta = stockChanges[productName];
                const targetProduct = product.find(p => p.productName === productName);

                if (targetProduct) {
                    const newStock = Number(targetProduct.stock) + delta;

                    const updatedProductData = {
                        ...targetProduct,
                        stock: newStock
                    };

                    updatedProductsPromises.push(
                        updateProductStock(targetProduct.id, updatedProductData).then(updatedServerProduct => ({
                            id: targetProduct.id,
                            updatedProduct: updatedServerProduct
                        }))
                    );
                }
            });

            // Tunggu semua update produk selesai
            const updatedProductsResults = await Promise.all(updatedProductsPromises);

            // 3. Update State Product di Context
            setProduct(prev => {
                let newState = [...prev];
                updatedProductsResults.forEach(({id, updatedProduct}) => {
                    newState = newState.map(p => (p.id === id ? updatedProduct : p));
                });
                return newState;
            });

            // 4. Update Order di Server
            const updatedOrderServer = await editOrderProduct(orderId, newOrderData);

            // 5. Update State Order di Context
            setOrder(prev => prev.map(o => (o.id === orderId ? updatedOrderServer : o)));

            return updatedOrderServer;
        } catch (error) {
            console.error("Gagal mengedit order atau stok:", error);
            alert("Terjadi kesalahan saat memperbarui order.");
            throw error;
        }
    };

    // --- Delete Order (Hapus Order) ---
    const onDeleteOrderProduct = async orderId => {
        const targetOrder = order.find(o => o.id === orderId);

        if (!targetOrder) {
            // Jika order tidak ada, anggap sudah terhapus
            setOrder(prev => prev.filter(o => o.id !== orderId));
            return;
        }

        // Logic sama seperti Declined: Kembalikan stok
        const productsToRevert = targetOrder.products;
        const stockRevertPromises = [];

        for (const orderItem of productsToRevert) {
            const productName = orderItem.productName;
            const amountToRevert = Number(orderItem.productAmount);

            const targetProduct = product.find(p => p.productName === productName);

            if (targetProduct) {
                const newStock = Number(targetProduct.stock) + amountToRevert;
                const updatedProductData = {
                    ...targetProduct,
                    stock: newStock
                };

                stockRevertPromises.push(
                    updateProductStock(targetProduct.id, updatedProductData).then(updatedServerProduct => ({
                        id: targetProduct.id,
                        updatedProduct: updatedServerProduct
                    }))
                );
            }
        }

        try {
            // Tunggu semua stok dikembalikan
            const updatedProductsResults = await Promise.all(stockRevertPromises);

            // Update State Product
            setProduct(prev => {
                let newState = [...prev];
                updatedProductsResults.forEach(({id, updatedProduct}) => {
                    newState = newState.map(p => (p.id === id ? updatedProduct : p));
                });
                return newState;
            });

            // Hapus Order dari Server
            await deleteOrderProduct(orderId);

            // Update State Order (dihapus)
            setOrder(prev => prev.filter(o => o.id !== orderId));
        } catch (error) {
            console.error("Gagal menghapus order atau mengembalikan stok:", error);
            throw new Error(`Gagal menghapus order: ${error.message}`);
        }
    };

    // --- Context Value ---
    const valueToShare = {
        // Product
        product,
        setProduct,
        fetchDataAPI,
        onCreateProduct,
        onEditProduct,
        // Order
        order,
        setOrder,
        fetchDataOrderAPI,
        onCreateOrderProduct,
        onEditOrderProduct,
        updateOrderStatusAPI,
        onDeleteOrderProduct,
        // Utility & Stats
        getProductStock,
        getProductDemand,
        calculateTotalRevenue,
        getRevenueCardData,
        // Transaction Log
        transactionLog,
        fetchTransactionLogAPI,
        deleteOrderAndRevertStockAPI,
        deleteMultipleOrdersAPI,
        // Customer (Kosongkan/biarkan jika Anda ingin state ini tetap ada)
        customers,
        setCustomers
    };

    return <ProductContext.Provider value={valueToShare}>{children}</ProductContext.Provider>;
}

export default ProductContext;
export {Provider};
