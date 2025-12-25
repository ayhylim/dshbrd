import {Box, Button, TextField, Stack, Typography, InputLabel, Select, FormControl, MenuItem} from "@mui/material";
import {useState, useContext, useCallback} from "react";
import ProductContext from "./context/ProductContext";
import {getRoleFromToken} from "../../../utils/getRoleFromToken";

const initialValue = {
    productName: "",
    category: "",
    stock: "",
    quantityType: ""
};

// 💡 HELPER: Format number dengan separator (tampilan saja, tidak mengubah value)
const formatNumberDisplay = numberString => {
    if (!numberString) return "";
    const numValue = parseFloat(numberString);
    if (isNaN(numValue)) return numberString;
    return new Intl.NumberFormat("id-ID").format(numValue);
};

const useInputHandler = (product, setProduct) => {
    return useCallback(
        e => {
            const {name, value} = e.target;

            if (name === "stock") {
                // 💡 UBAH: Terima angka desimal
                // Hapus karakter non-numeric kecuali titik (.)
                const rawValue = value.replace(/[^0-9.]/g, "");

                // Validasi: hanya boleh 1 titik
                const dotCount = (rawValue.match(/\./g) || []).length;
                if (dotCount > 1) return; // Jangan update jika lebih dari 1 titik

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

export default function AddProduct() {
    const [product, setProduct] = useState(initialValue);
    const {onCreateProduct, onAddProductHistory, product: allProducts} = useContext(ProductContext);
    const userRole = getRoleFromToken();

    const handleInput = useInputHandler(product, setProduct);

    // 🟢 ONLY WAREHOUSE CAN CREATE
    if (userRole !== "warehouse") {
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
                    p: 4,
                    textAlign: "center"
                }}
            >
                <Typography variant="h6" color="error">
                    ❌ Access Denied
                </Typography>
                <Typography variant="body2" sx={{mt: 2}}>
                    Hanya Warehouse yang dapat membuat product baru.
                </Typography>
                <Typography variant="caption" color="textSecondary">
                    Role Anda: <strong>{userRole?.toUpperCase()}</strong>
                </Typography>
            </Box>
        );
    }

    const handleSubmit = async e => {
        e.preventDefault();

        if (!product.quantityType) {
            alert("Pilih Quantity Type (pcs, kg, dll.)");
            return;
        }

        // 💡 Validasi stock
        const stockValue = parseFloat(product.stock);
        if (isNaN(stockValue) || stockValue < 0) {
            alert("Stock harus berupa angka positif (integer atau desimal)");
            return;
        }

        const finalProduct = {
            ...product,
            stock: stockValue
        };

        try {
            console.log("📝 Creating product:", finalProduct);
            await onCreateProduct(finalProduct);

            const createdProduct = allProducts[0];

            if (!createdProduct) {
                throw new Error("Produk tidak ditemukan setelah dibuat");
            }

            console.log("✅ Created product:", createdProduct);

            // 💡 TAMBAH: Log ke product history
            const historyData = {
                productId: createdProduct.id,
                productName: createdProduct.productName,
                category: createdProduct.category,
                stock: createdProduct.stock,
                quantityType: createdProduct.quantityType,
                addedBy: getRoleFromToken() || "system"
            };

            console.log("📋 Adding to history:", historyData);
            await onAddProductHistory(historyData);

            // Clear form
            setProduct(initialValue);
            alert("✅ Produk berhasil ditambahkan dan tercatat di history!");
        } catch (error) {
            console.error("❌ Error:", error);
            alert(`❌ Terjadi kesalahan: ${error.message}`);
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
                Tambah Produk Baru
            </Typography>

            <Box component="form" onSubmit={handleSubmit} autoComplete="off">
                <Stack spacing={3}>
                    <TextField
                        required
                        fullWidth
                        id="productName"
                        name="productName"
                        label="Product Name"
                        variant="outlined"
                        onChange={handleInput}
                        value={product.productName}
                    />
                    <TextField
                        required
                        fullWidth
                        id="category"
                        name="category"
                        label="Category"
                        variant="outlined"
                        onChange={handleInput}
                        value={product.category}
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
                            value={product.stock}
                            onChange={handleInput}
                            placeholder="Contoh: 10 atau 10.5 atau 10.25"
                            helperText="Masukkan angka positif. Contoh: 5, 5.5, 5.25"
                            inputProps={{inputMode: "decimal", pattern: "[0-9.]*"}}
                        />
                        <FormControl variant="outlined" sx={{minWidth: 120}}>
                            <InputLabel id="quantityType-label">Unit</InputLabel>
                            <Select
                                labelId="quantityType-label"
                                id="quantityType"
                                name="quantityType"
                                value={product.quantityType}
                                onChange={handleInput}
                                label="Unit"
                            >
                                <MenuItem value={"pcs"}>Pcs</MenuItem>
                                <MenuItem value={"kg"}>Kg</MenuItem>
                                <MenuItem value={"roll"}>Roll</MenuItem>
                                <MenuItem value={"pack"}>Pack</MenuItem>
                                <MenuItem value={"unit"}>Unit</MenuItem>
                                <MenuItem value={"set"}>Set</MenuItem>
                                <MenuItem value={"meter"}>Meter</MenuItem>
                                <MenuItem value={"liter"}>Liter</MenuItem>
                                <MenuItem value={"ton"}>Ton</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                    <Button type="submit" fullWidth variant="contained" color="primary" size="large" sx={{mt: 3}}>
                        Add Product
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}
