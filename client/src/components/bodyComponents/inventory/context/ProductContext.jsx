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
    fetchTransactionLog,
    fetchProductHistory,
    addProductHistory,
    deleteProductHistory
} from "../../../../api/api";
import {getRoleFromToken} from "../../../../utils/getRoleFromToken";

const ProductContext = createContext();

function Provider({children}) {
    const [product, setProduct] = useState([]);
    const [order, setOrder] = useState([]);
    const [transactionLog, setTransactionLog] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [productHistory, setProductHistory] = useState([]);

    // 🟢 GET ROLE FROM TOKEN
    const getUserRole = useCallback(() => {
        return getRoleFromToken() || "marketing";
    }, []);

    // ============================================
    // PRODUCT OPERATIONS - ROLE BASED
    // ============================================

    const fetchDataAPI = useCallback(async () => {
        try {
            const role = getUserRole();
            const res = await fetchProduct();

            console.log(`📥 Fetched products for role: ${role}`);
            console.log("Products:", res);

            setProduct(res);
        } catch (error) {
            console.error("Gagal mengambil data produk:", error);
        }
    }, [getUserRole]);

    // 🟢 CREATE PRODUCT - WAREHOUSE ONLY
    const onCreateProduct = async data => {
        const role = getUserRole();

        if (role !== "warehouse") {
            throw new Error(`❌ Role ${role} tidak dapat membuat product. Hanya warehouse yang boleh.`);
        }

        try {
            console.log(`📝 Creating product as ${role}:`, data);
            const res = await addProduct(data);
            setProduct(prev => [...prev, res.data]);
            console.log("✅ Product created successfully");
        } catch (error) {
            console.error("Gagal membuat produk:", error);
            throw error;
        }
    };

    // 🟢 EDIT PRODUCT - ROLE BASED
    const onEditProduct = async (id, updatedData) => {
        const role = getUserRole();

        try {
            // WAREHOUSE: Hanya bisa edit productName, category, stock, quantityType
            if (role === "warehouse") {
                console.log(`🔧 Warehouse editing product ${id}:`, updatedData);

                const cleanedData = {
                    productName: updatedData.productName,
                    category: updatedData.category,
                    stock: updatedData.stock,
                    quantityType: updatedData.quantityType
                };

                const res = await editProduct(id, cleanedData);
                setProduct(prev => prev.map(p => (p.id === id ? res : p)));
                console.log("✅ Product updated by warehouse");
                return res;
            }

            // PURCHASING: Hanya bisa edit hargaModal & hargaJual
            if (role === "purchasing") {
                console.log(`💰 Purchasing editing prices for product ${id}:`, updatedData);

                const cleanedData = {
                    hargaModal: updatedData.hargaModal,
                    hargaJual: updatedData.hargaJual
                };

                const res = await editProduct(id, cleanedData);
                setProduct(prev => prev.map(p => (p.id === id ? res : p)));
                console.log("✅ Product prices updated by purchasing");
                return res;
            }

            // MARKETING: Tidak boleh edit
            if (role === "marketing") {
                throw new Error("❌ Marketing tidak dapat mengedit product");
            }

            throw new Error("❌ Role tidak dikenali untuk edit product");
        } catch (error) {
            console.error("Gagal mengedit produk:", error);
            throw error;
        }
    };

    // 🟢 DELETE PRODUCT - WAREHOUSE ONLY
    const onDeleteProduct = async id => {
        const role = getUserRole();

        if (role !== "warehouse") {
            throw new Error(`❌ Role ${role} tidak dapat menghapus product. Hanya warehouse yang boleh.`);
        }

        try {
            console.log(`🗑️ Warehouse deleting product ${id}`);
            await deleteOrderProduct(id);
            console.log("✅ Product deleted successfully");
        } catch (error) {
            console.error("Gagal menghapus produk:", error);
            throw error;
        }
    };

    // ============================================
    // ORDER OPERATIONS (EXISTING)
    // ============================================

    const fetchDataOrderAPI = useCallback(async () => {
        try {
            const res = await fetchOrderProduct();
            setOrder(res);
        } catch (error) {
            console.error("Gagal mengambil data order:", error);
        }
    }, []);

    const getProductStock = productName => {
        const targetProduct = product.find(p => p.productName === productName);
        return targetProduct ? Number(targetProduct.stock) : 0;
    };

    const onCreateOrderProduct = async data => {
        const newOrderWithStatus = {...data, status: "Pending", dateCreated: new Date().toISOString()};
        const productsToProcess = newOrderWithStatus.products;

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

        const updateStockPromises = [];

        for (const newOrderProduct of productsToProcess) {
            const productName = newOrderProduct.productName;
            const orderedAmount = Number(newOrderProduct.productAmount);
            const targetProduct = product.find(p => p.productName === productName);

            const newStock = Number(targetProduct.stock) - orderedAmount;

            const updatedProductData = {
                ...targetProduct,
                stock: newStock
            };

            updateStockPromises.push(
                updateProductStock(targetProduct.id, updatedProductData).then(updatedServerProduct => ({
                    id: targetProduct.id,
                    updatedProduct: updatedServerProduct
                }))
            );
        }

        try {
            const updatedProductsResults = await Promise.all(updateStockPromises);

            setProduct(prev => {
                let newState = [...prev];
                updatedProductsResults.forEach(({id, updatedProduct}) => {
                    newState = newState.map(p => (p.id === id ? updatedProduct : p));
                });
                return newState;
            });

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
        const finalStockChanges = {};

        ordersToRevert.forEach(targetOrder => {
            targetOrder.products.forEach(item => {
                const productName = item.productName;
                const amount = Number(item.productAmount);
                finalStockChanges[productName] = (finalStockChanges[productName] || 0) + amount;
            });
        });

        const updatePromises = [];

        for (const productName in finalStockChanges) {
            const amountToRevert = finalStockChanges[productName];
            const targetProduct = product.find(p => p.productName === productName);

            if (targetProduct) {
                const newStock = Number(targetProduct.stock) + amountToRevert;

                const updatedProductData = {
                    ...targetProduct,
                    stock: newStock
                };

                updatePromises.push(
                    updateProductStock(targetProduct.id, updatedProductData).then(updatedServerProduct => ({
                        id: targetProduct.id,
                        updatedProduct: updatedServerProduct
                    }))
                );
            }
        }

        const updatedProductsResults = await Promise.all(updatePromises);

        setProduct(prev => {
            let newState = [...prev];
            updatedProductsResults.forEach(({id, updatedProduct}) => {
                newState = newState.map(p => (p.id === id ? updatedProduct : p));
            });
            return newState;
        });

        if (deleteFromOrderState) {
            const deletePromises = orderIds.map(id => deleteOrderProduct(id));
            await Promise.all(deletePromises);

            setOrder(prev => prev.filter(o => !orderIds.includes(o.id)));
        }

        return true;
    };

    const deleteOrderAndRevertStock = async orderId => {
        return revertStockForOrders([orderId]);
    };

    const updateOrderStatusAPI = async (orderId, newStatus) => {
        const targetOrder = order.find(o => o.id === orderId);

        if (!targetOrder) {
            throw new Error(`Order ID ${orderId} tidak ditemukan.`);
        }

        if (targetOrder.status === "Accepted") {
            throw new Error(`Order ID ${orderId} sudah berstatus Accepted dan tidak bisa diubah.`);
        }

        if (newStatus === "Declined") {
            await deleteOrderAndRevertStock(orderId);
            return {...targetOrder, status: "Declined", isDeleted: true};
        } else if (newStatus === "Accepted") {
            try {
                const acceptedAtTime = new Date().toISOString();
                const transactionData = {
                    ...targetOrder,
                    originalOrderId: targetOrder.id,
                    status: "Accepted",
                    acceptedAt: acceptedAtTime
                };
                await createTransactionLog(transactionData);

                const updatedServerOrder = await editOrderProduct(orderId, {
                    status: "Accepted",
                    acceptedAt: acceptedAtTime
                });

                setOrder(prev => prev.map(o => (o.id === orderId ? updatedServerOrder : o)));
                setTransactionLog(prev => [...prev, transactionData]);

                return updatedServerOrder;
            } catch (error) {
                console.error("Gagal memproses Accepted atau membuat log transaksi:", error);
                throw new Error(`Gagal memproses Accepted: ${error.message}`);
            }
        } else {
            throw new Error("Status baru tidak valid.");
        }
    };

    const deleteMultipleOrdersAPI = async orderIds => {
        return revertStockForOrders(orderIds);
    };

    const deleteOrderAndRevertStockAPI = async orderId => {
        return deleteOrderAndRevertStock(orderId);
    };

    // ============================================
    // TRANSACTION LOG OPERATIONS (EXISTING)
    // ============================================

    const fetchTransactionLogAPI = useCallback(async () => {
        try {
            const res = await fetchTransactionLog();
            setTransactionLog(res);
        } catch (error) {
            console.error("Gagal mengambil log transaksi:", error);
        }
    }, []);

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
        const totalAcceptedOrders = transactionLog.length;
        const uniqueCustomers = new Set(transactionLog.map(o => o.customer)).size;

        return [
            {
                isMoney: false,
                number: String(totalAcceptedOrders),
                upOrDown: totalAcceptedOrders > 100 ? "up" : "down",
                color: totalAcceptedOrders > 100 ? "green" : "red",
                title: "Total Orders (Accepted)",
                subTitle: "vs prev year (Simulated)"
            },
            {
                isMoney: false,
                number: String(uniqueCustomers),
                upOrDown: uniqueCustomers > 50 ? "up" : "down",
                color: uniqueCustomers > 50 ? "green" : "red",
                title: "Total Customer",
                subTitle: "vs prev year (Simulated)"
            },
            {
                isMoney: false,
                number: String(totalProducts),
                upOrDown: totalProducts > 500 ? "up" : "down",
                color: totalProducts > 500 ? "green" : "red",
                title: "Total Product",
                subTitle: "vs prev month (Simulated)"
            }
        ];
    };

    // ============================================
    // EDIT ORDER (EXISTING)
    // ============================================

    const onEditOrderProduct = async (orderId, oldOrder, newOrderData) => {
        try {
            const stockChanges = {};

            if (oldOrder && oldOrder.products) {
                oldOrder.products.forEach(p => {
                    const amount = Number(p.productAmount);
                    stockChanges[p.productName] = (stockChanges[p.productName] || 0) + amount;
                });
            }

            if (newOrderData && newOrderData.products) {
                newOrderData.products.forEach(p => {
                    const amount = Number(p.productAmount);
                    stockChanges[p.productName] = (stockChanges[p.productName] || 0) - amount;
                });
            }

            const productsToUpdate = Object.keys(stockChanges);
            const updatedProductsPromises = [];

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

            const updatedProductsResults = await Promise.all(updatedProductsPromises);

            setProduct(prev => {
                let newState = [...prev];
                updatedProductsResults.forEach(({id, updatedProduct}) => {
                    newState = newState.map(p => (p.id === id ? updatedProduct : p));
                });
                return newState;
            });

            const updatedOrderServer = await editOrderProduct(orderId, newOrderData);

            setOrder(prev => prev.map(o => (o.id === orderId ? updatedOrderServer : o)));

            return updatedOrderServer;
        } catch (error) {
            console.error("Gagal mengedit order atau stok:", error);
            alert("Terjadi kesalahan saat memperbarui order.");
            throw error;
        }
    };

    // ============================================
    // DELETE ORDER (EXISTING)
    // ============================================

    const onDeleteOrderProduct = async orderId => {
        const targetOrder = order.find(o => o.id === orderId);

        if (!targetOrder) {
            setOrder(prev => prev.filter(o => o.id !== orderId));
            return;
        }

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
            const updatedProductsResults = await Promise.all(stockRevertPromises);

            setProduct(prev => {
                let newState = [...prev];
                updatedProductsResults.forEach(({id, updatedProduct}) => {
                    newState = newState.map(p => (p.id === id ? updatedProduct : p));
                });
                return newState;
            });

            await deleteOrderProduct(orderId);

            setOrder(prev => prev.filter(o => o.id !== orderId));
        } catch (error) {
            console.error("Gagal menghapus order atau mengembalikan stok:", error);
            throw new Error(`Gagal menghapus order: ${error.message}`);
        }
    };

    // ============ PRODUCT HISTORY OPERATIONS ============

    const fetchProductHistoryAPI = useCallback(async () => {
        try {
            const res = await fetchProductHistory();
            setProductHistory(res);
            console.log("✅ Product history loaded:", res);
        } catch (error) {
            console.error("Gagal mengambil product history:", error);
        }
    }, []);

    const onAddProductHistory = useCallback(async historyData => {
        try {
            const res = await addProductHistory(historyData);
            setProductHistory(prev => [res.data, ...prev]);
            console.log("✅ History entry added:", res.data);
            return res.data;
        } catch (error) {
            console.error("Gagal menambah history:", error);
            throw error;
        }
    }, []);

    const onDeleteProductHistory = useCallback(async id => {
        try {
            await deleteProductHistory(id);
            setProductHistory(prev => prev.filter(h => h.id !== id));
            console.log("✅ History deleted");
        } catch (error) {
            console.error("Gagal menghapus history:", error);
            throw error;
        }
    }, []);

    // ============================================
    // CONTEXT VALUE
    // ============================================

    const valueToShare = {
        // Product
        product,
        setProduct,
        fetchDataAPI,
        onCreateProduct,
        onEditProduct,
        onDeleteProduct,
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
        // Customer
        customers,
        setCustomers,
        // Role utility
        getUserRole,
        productHistory,
        fetchProductHistoryAPI,
        onAddProductHistory,
        onDeleteProductHistory
    };

    return <ProductContext.Provider value={valueToShare}>{children}</ProductContext.Provider>;
}

export default ProductContext;
export {Provider};
