// #EditProduct.jsx

import {Box, Button, TextField, Stack, Typography} from "@mui/material";
import {useState, useContext, useCallback, useEffect} from "react";
import ProductContext from "./context/ProductContext";
import {editProduct} from "../../../api/api";

// HELPER FUNCTION: Format Angka menjadi Rupiah (sama seperti di AddProduct)
const formatRupiah = numberString => {
    const rawValue = String(numberString).replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("id-ID").format(Number(rawValue));
};

// HELPER FUNCTION: Menangani perubahan input biasa (sama seperti di AddProduct)
const useInputHandler = (product, setProduct) => {
    return useCallback(
        e => {
            const {name, value} = e.target;

            if (name === "price" || name === "stock") {
                const rawValue = value.replace(/\D/g, "");
                setProduct(prev => ({
                    ...prev,
                    [name]: rawValue
                }));
            } else {
                setProduct(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        },
        [setProduct]
    );
};

// ------------------- KOMPONEN UTAMA -------------------
// Menerima productToEdit dari Products.jsx
export default function EditProduct({productToEdit, onClose}) {
    // State untuk form: Diinisialisasi dengan data produk yang akan diedit
    const [editedProduct, setEditedProduct] = useState({
        id: "",
        productName: "",
        category: "",
        price: "",
        stock: ""
    });

    // Ambil setProduct dari context untuk update state produk global
    const {setProduct} = useContext(ProductContext);

    // Isi state saat komponen pertama kali dimuat atau productToEdit berubah
    useEffect(() => {
        if (productToEdit) {
            setEditedProduct({
                // Pastikan price dan stock di-cast ke string jika disimpan sebagai number di state global
                id: productToEdit.id || "",
                productName: productToEdit.productName || "",
                category: productToEdit.category || "",
                price: String(productToEdit.price || 0),
                stock: String(productToEdit.stock || 0)
            });
        }
    }, [productToEdit]);

    // Menggunakan custom hook/helper untuk input
    const handleInput = useInputHandler(editedProduct, setEditedProduct);

    const handleSubmit = async e => {
        e.preventDefault();

        if (!productToEdit || !productToEdit.id) return;

        // 🚨 FINALISASI DATA SEBELUM SUBMIT
        const finalProduct = {
            ...editedProduct,
            // Konversi nilai string murni menjadi Number
            price: Number(editedProduct.price || 0),
            stock: Number(editedProduct.stock || 0)
        };

        try {
            // Panggil API editProduct (PUT request)
            const updatedProduct = await editProduct(productToEdit.id, finalProduct);

            // Update state produk global di ProductContext
            setProduct(prev => prev.map(p => (p.id === productToEdit.id ? updatedProduct : p)));

            alert(`Produk ${updatedProduct.productName} berhasil diperbarui!`);
            onClose(); // Tutup modal
        } catch (err) {
            console.error("Gagal mengedit produk:", err);
            alert("Terjadi error saat memperbarui produk.");
        }
    };

    return (
        <Box
            sx={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: {xs: "90%", sm: "70%", md: "50%"},
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 24,
                p: 4
            }}
        >
            <Typography variant="h5" component="h2" gutterBottom>
                Edit Produk: {editedProduct.productName}
            </Typography>

            <Box component="form" onSubmit={handleSubmit} autoComplete="off">
                <Stack spacing={3}>
                    {/* ID (Biasanya ID tidak boleh diubah, jadi buat readOnly) */}
                    <TextField
                        required
                        fullWidth
                        id="id"
                        name="id"
                        label="Product ID"
                        variant="outlined"
                        value={editedProduct.id}
                        InputProps={{readOnly: true}}
                    />

                    {/* Name, Category menggunakan handleInput */}
                    <TextField
                        required
                        fullWidth
                        id="productName"
                        name="productName"
                        label="Product Name"
                        variant="outlined"
                        onChange={handleInput}
                        value={editedProduct.productName}
                    />
                    <TextField
                        required
                        fullWidth
                        id="category"
                        name="category"
                        label="Category"
                        variant="outlined"
                        onChange={handleInput}
                        value={editedProduct.category}
                    />

                    <Stack direction="row" spacing={2}>
                        {/* Price */}
                        <TextField
                            required
                            fullWidth
                            id="price"
                            name="price"
                            label="Price (Rp)"
                            variant="outlined"
                            type="text"
                            value={formatRupiah(editedProduct.price)}
                            onChange={handleInput}
                            inputProps={{inputMode: "numeric"}}
                        />

                        {/* STOCK */}
                        <TextField
                            required
                            fullWidth
                            id="stock"
                            name="stock"
                            label="Stock Quantity"
                            variant="outlined"
                            type="text"
                            value={editedProduct.stock}
                            onChange={handleInput}
                            inputProps={{inputMode: "numeric", pattern: "[0-9]*"}}
                        />
                    </Stack>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="success" // Warna hijau untuk Update
                        size="large"
                        sx={{mt: 3}}
                    >
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
