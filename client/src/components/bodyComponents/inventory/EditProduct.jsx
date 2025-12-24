import {Box, Button, TextField, Stack, Typography} from "@mui/material";
import {useState, useContext, useCallback, useEffect} from "react";
import ProductContext from "./context/ProductContext";
import {editProduct} from "../../../api/api";
import axios from "axios";

const useInputHandler = (product, setProduct) => {
    return useCallback(
        e => {
            const {name, value} = e.target;

            if (name === "stock") {
                // 💡 UBAH: Terima angka desimal
                const rawValue = value.replace(/[^0-9.]/g, "");

                // Validasi: hanya boleh 1 titik
                const dotCount = (rawValue.match(/\./g) || []).length;
                if (dotCount > 1) return;

                // Validasi: tidak boleh negatif
                const numValue = parseFloat(rawValue);
                if (!isNaN(numValue) && numValue < 0) return;

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

export default function EditProduct({productToEdit, onClose}) {
    const [editedProduct, setEditedProduct] = useState({
        id: "",
        productName: "",
        category: "",
        stock: "",
        quantityType: "",
        price: 0,
        hargaModal: 0
    });

    const [isLoading, setIsLoading] = useState(false);
    const {setProduct} = useContext(ProductContext);

    // 🟢 FETCH FULL DATA from backend when modal opens
    useEffect(() => {
        if (productToEdit) {
            console.log("🔄 [EditProduct] Fetching FULL data from backend for product:", productToEdit.id);

            axios
                .get(`http://127.0.0.1:3001/productList`)
                .then(response => {
                    const fullProduct = response.data.find(p => p.id === productToEdit.id);

                    if (fullProduct) {
                        console.log("✅ [EditProduct] FULL data received from backend:", fullProduct);

                        setEditedProduct({
                            id: fullProduct.id || "",
                            productName: fullProduct.productName || "",
                            category: fullProduct.category || "",
                            stock: String(fullProduct.stock || 0), // 💡 Convert to string untuk display
                            quantityType: fullProduct.quantityType || "",
                            price: fullProduct.price || 0,
                            hargaModal: fullProduct.hargaModal || 0
                        });
                    } else {
                        console.warn("⚠️ [EditProduct] Product not found in backend, using UI data");
                        setEditedProduct({
                            id: productToEdit.id || "",
                            productName: productToEdit.productName || "",
                            category: productToEdit.category || "",
                            stock: String(productToEdit.stock || 0),
                            quantityType: productToEdit.quantityType || "",
                            price: productToEdit.price || 0,
                            hargaModal: productToEdit.hargaModal || 0
                        });
                    }
                })
                .catch(error => {
                    console.error("❌ [EditProduct] Error fetching data:", error);
                    setEditedProduct({
                        id: productToEdit.id || "",
                        productName: productToEdit.productName || "",
                        category: productToEdit.category || "",
                        stock: String(productToEdit.stock || 0),
                        quantityType: productToEdit.quantityType || "",
                        price: productToEdit.price || 0,
                        hargaModal: productToEdit.hargaModal || 0
                    });
                });
        }
    }, [productToEdit]);

    const handleInput = useInputHandler(editedProduct, setEditedProduct);

    const handleSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);

        if (!productToEdit || !productToEdit.id) {
            setIsLoading(false);
            return;
        }

        // 💡 Validasi stock
        const stockValue = parseFloat(editedProduct.stock);
        if (isNaN(stockValue) || stockValue < 0) {
            alert("Stock harus berupa angka positif (integer atau desimal)");
            setIsLoading(false);
            return;
        }

        const finalProduct = {
            id: editedProduct.id,
            productName: editedProduct.productName,
            category: editedProduct.category,
            stock: stockValue,
            quantityType: editedProduct.quantityType,
            price: editedProduct.price,
            hargaModal: editedProduct.hargaModal
        };

        console.log("📤 [EditProduct] Sending FULL data:", finalProduct);

        try {
            const updatedProduct = await editProduct(productToEdit.id, finalProduct);

            console.log("✅ [EditProduct] Updated product from backend:", updatedProduct);

            setProduct(prev => prev.map(p => (p.id === productToEdit.id ? updatedProduct : p)));

            alert(`Produk ${updatedProduct.productName} berhasil diperbarui!`);
            onClose();
        } catch (err) {
            console.error("❌ [EditProduct] Error:", err);
            alert("Terjadi error saat memperbarui produk.");
        } finally {
            setIsLoading(false);
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
                        <TextField
                            required
                            fullWidth
                            id="stock"
                            name="stock"
                            label="Stock Quantity (Integer atau Desimal)"
                            variant="outlined"
                            type="text"
                            value={editedProduct.stock}
                            onChange={handleInput}
                            placeholder="Contoh: 10 atau 10.5 atau 10.25"
                            helperText="Masukkan angka positif. Contoh: 5, 5.5, 5.25"
                            inputProps={{inputMode: "decimal", pattern: "[0-9.]*"}}
                        />
                        <TextField
                            required
                            fullWidth
                            id="quantityType"
                            name="quantityType"
                            label="Unit"
                            variant="outlined"
                            value={editedProduct.quantityType}
                            onChange={handleInput}
                        />
                    </Stack>

                    {/* Info fields (read-only) */}
                    <Box sx={{p: 2, bgcolor: "#f5f5f5", borderRadius: 1}}>
                        <Typography variant="caption" color="textSecondary">
                            (Pricing managed by Purchasing)
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{mt: 1}}>
                            Harga Modal: <strong>Rp {Number(editedProduct.hargaModal).toLocaleString("id-ID")}</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{mt: 1}}>
                            Harga Jual: <strong>Rp {Number(editedProduct.price).toLocaleString("id-ID")}</strong>
                        </Typography>
                    </Box>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="success"
                        size="large"
                        sx={{mt: 3}}
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                        type="button"
                        fullWidth
                        variant="outlined"
                        onClick={onClose}
                        size="large"
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}
