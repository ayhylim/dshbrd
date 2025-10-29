// #EditOrderModal.jsx

import {Box, Button, TextField, Stack, Typography, Grid, IconButton} from "@mui/material";
import {useState, useContext, useEffect} from "react";
import ProductContext from "../inventory/context/ProductContext";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

// ------------------- KOMPONEN UTAMA -------------------
// Menerima orderToEdit dan onClose dari OrderList.jsx
export default function EditOrderModal({orderToEdit, onClose}) {
    const {product: productList, onEditOrderProduct, getProductStock} = useContext(ProductContext);

    // State yang mencerminkan struktur order
    const [editedOrder, setEditedOrder] = useState({
        id: "",
        customer: "",
        date: new Date().toISOString().split("T")[0], // Mengambil tanggal hari ini sebagai default
        status: "Pending",
        products: [{productName: "", productAmount: 1, price: 0}] // Minimal satu item
    });

    const [availableProducts, setAvailableProducts] = useState(productList.map(p => p.productName));

    // 1. Inisialisasi state saat orderToEdit berubah
    useEffect(() => {
        if (orderToEdit) {
            // Mapping order lama ke format state form
            const initialProducts = (orderToEdit.products || []).map(p => ({
                productName: p.productName,
                productAmount: p.productAmount,
                price: p.price // Simpan harga per unit
            }));

            setEditedOrder({
                id: orderToEdit.id || "",
                customer: orderToEdit.customer || "",
                date: orderToEdit.date || new Date().toISOString().split("T")[0],
                status: orderToEdit.status || "Pending",
                products: initialProducts.length > 0 ? initialProducts : [{productName: "", productAmount: 1, price: 0}]
            });
        }
    }, [orderToEdit]);

    // 2. Helper: Cari harga produk per unit
    const getProductPrice = productName => {
        const target = productList.find(p => p.productName === productName);
        return target ? target.price : 0;
    };

    // 3. Handle perubahan pada field dasar Order (customer, date)
    const handleOrderChange = e => {
        const {name, value} = e.target;
        setEditedOrder(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 4. Handle perubahan pada field Product Order (nama produk, jumlah)
    const handleProductChange = (index, e) => {
        const {name, value} = e.target;
        const newProducts = [...editedOrder.products];
        let newValue = value;

        if (name === "productAmount") {
            // Pastikan nilai adalah angka positif
            newValue = Math.max(1, parseInt(value) || 1);

            // Cek stok (Anda bisa menambahkan validasi stok yang lebih ketat di sini)
            const productName = newProducts[index].productName;
            const currentStock = getProductStock(productName);

            if (newValue > currentStock + getProductAmountInOldOrder(productName)) {
                alert(`Jumlah order melebihi stok yang tersedia (${currentStock} unit)!`);
                newValue = currentStock + getProductAmountInOldOrder(productName); // Batasi ke Max Stock
            }

            newProducts[index].productAmount = newValue;
        } else if (name === "productName") {
            newProducts[index].productName = newValue;
            // Update harga otomatis saat produk diubah
            newProducts[index].price = getProductPrice(newValue);
        }

        setEditedOrder(prev => ({...prev, products: newProducts}));
    };

    // 5. Menambahkan item produk baru
    const handleAddProduct = () => {
        setEditedOrder(prev => ({
            ...prev,
            products: [...prev.products, {productName: "", productAmount: 1, price: 0}]
        }));
    };

    // 6. Menghapus item produk
    const handleRemoveProduct = index => {
        const newProducts = editedOrder.products.filter((_, i) => i !== index);
        setEditedOrder(prev => ({
            ...prev,
            products: newProducts.length > 0 ? newProducts : [{productName: "", productAmount: 1, price: 0}]
        }));
    };

    // 7. Helper: Mendapatkan jumlah produk yang sama pada order lama (untuk validasi stok)
    const getProductAmountInOldOrder = productName => {
        if (!orderToEdit || !orderToEdit.products) return 0;
        const oldItem = orderToEdit.products.find(p => p.productName === productName);
        return oldItem ? Number(oldItem.productAmount) : 0;
    };

    // 8. Handle Submit
    const handleSubmit = async e => {
        e.preventDefault();

        // Filter produk yang kosong atau jumlahnya 0 sebelum submit
        const finalProducts = editedOrder.products.filter(p => p.productName && p.productAmount > 0);

        if (finalProducts.length === 0) {
            alert("Harap masukkan minimal satu produk dengan jumlah yang valid.");
            return;
        }

        const finalOrder = {
            ...editedOrder,
            products: finalProducts
            // ID harus tetap sama seperti orderToEdit.id
        };

        try {
            // Panggil fungsi edit dari ProductContext
            await onEditOrderProduct(orderToEdit.id, orderToEdit, finalOrder);
            alert(`Order ID ${orderToEdit.id} berhasil diperbarui!`);
            onClose();
        } catch (err) {
            console.error("Gagal mengedit order:", err);
            // Alert sudah ada di ProductContext, tapi bisa ditambahkan lagi jika perlu
        }
    };

    // Jika orderToEdit belum dimuat, tampilkan loading/kosong
    if (!orderToEdit) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box
            sx={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: {xs: "90%", sm: "70%", md: "60%"},
                maxHeight: "80vh",
                overflowY: "auto",
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 24,
                p: 4
            }}
        >
            <Typography variant="h5" component="h2" gutterBottom>
                Edit Order ID: {editedOrder.id}
            </Typography>

            <Box component="form" onSubmit={handleSubmit} autoComplete="off">
                <Stack spacing={3}>
                    {/* Customer & Date */}
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                required
                                fullWidth
                                id="customer"
                                name="customer"
                                label="Customer Name"
                                variant="outlined"
                                onChange={handleOrderChange}
                                value={editedOrder.customer}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                required
                                fullWidth
                                id="date"
                                name="date"
                                label="Order Date"
                                variant="outlined"
                                type="date"
                                onChange={handleOrderChange}
                                value={editedOrder.date}
                                InputLabelProps={{shrink: true}}
                            />
                        </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{mt: 3, mb: 1}}>
                        Products Ordered
                    </Typography>

                    {/* List Produk */}
                    <Stack spacing={2}>
                        {editedOrder.products.map((productItem, index) => (
                            <Grid container spacing={2} key={index} alignItems="center">
                                {/* Product Name (Gunakan TextField atau ComboBox) */}
                                <Grid item xs={6}>
                                    <TextField
                                        select
                                        required
                                        fullWidth
                                        name="productName"
                                        label="Product Name"
                                        variant="outlined"
                                        value={productItem.productName}
                                        onChange={e => handleProductChange(index, e)}
                                        SelectProps={{native: true}}
                                    >
                                        <option value="" disabled>
                                            Select Product
                                        </option>
                                        {availableProducts.map(pName => (
                                            <option key={pName} value={pName}>
                                                {pName} (Stock: {getProductStock(pName)})
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>

                                {/* Quantity */}
                                <Grid item xs={4}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="productAmount"
                                        label="Quantity"
                                        variant="outlined"
                                        type="number"
                                        inputProps={{min: 1}}
                                        value={productItem.productAmount}
                                        onChange={e => handleProductChange(index, e)}
                                    />
                                </Grid>

                                {/* Delete Button */}
                                <Grid item xs={2}>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleRemoveProduct(index)}
                                        disabled={editedOrder.products.length === 1}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
                    </Stack>

                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddProduct} sx={{mt: 2}}>
                        Add Another Product
                    </Button>

                    {/* Tombol Aksi */}
                    <Button type="submit" fullWidth variant="contained" color="success" size="large" sx={{mt: 3}}>
                        Save Changes
                    </Button>
                    <Button type="button" fullWidth variant="outlined" onClick={onClose} size="large">
                        Batal
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}
