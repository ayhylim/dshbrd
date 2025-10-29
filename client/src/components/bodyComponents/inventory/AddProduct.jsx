import {Box, Button, TextField, Stack, Typography, InputLabel, Select, FormControl, MenuItem} from "@mui/material";
import {useState, useContext, useCallback} from "react"; // Menambah useCallback untuk efisiensi
import ProductContext from "./context/ProductContext";

const initialValue = {
    id: "",
    productName: "",
    category: "",
    // Menggunakan string kosong untuk price dan stock agar bisa menampung input user
    price: "",
    stock: "",
    quantityType: ""
};

// HELPER FUNCTION: Format Angka menjadi Rupiah (untuk tampilan UI)
const formatRupiah = numberString => {
    const rawValue = String(numberString).replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("id-ID").format(Number(rawValue));
};

// HELPER FUNCTION: Menangani perubahan input biasa (price, stock, text)
// Fungsi ini menyimpan nilai MURNI (tanpa titik/koma) ke state
const useInputHandler = (product, setProduct) => {
    return useCallback(
        e => {
            const {name, value} = e.target;

            // Cek jika field adalah PRICE atau STOCK
            if (name === "price" || name === "stock") {
                // Hapus semua karakter non-angka (kecuali minus jika diperlukan, tapi untuk price/stock tidak perlu)
                const rawValue = value.replace(/\D/g, "");
                setProduct(prev => ({
                    ...prev,
                    [name]: rawValue // Simpan sebagai string angka murni (e.g., "100000", "5")
                }));
            } else {
                // Untuk field non-angka (id, productName, category)
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
export default function AddProduct() {
    const [product, setProduct] = useState(initialValue);
    const {onCreateProduct} = useContext(ProductContext);

    // Menggunakan custom hook/helper untuk input non-image
    const handleInput = useInputHandler(product, setProduct);

    const handleSubmit = async e => {
        e.preventDefault();

        if (!product.quantityType) {
            alert("Pilih Quantity Type (pcs, kg, dll.)");
            return;
        }

        // 🚨 FINALISASI DATA SEBELUM SUBMIT: Pastikan price dan stock adalah Number
        const finalProduct = {
            ...product,
            // Konversi nilai string murni menjadi Number (untuk backend/API)
            price: Number(product.price || 0),
            stock: Number(product.stock || 0)
        };

        await onCreateProduct(finalProduct);
        console.log(finalProduct);
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
                    {/* ID, Name, Category menggunakan handleInput */}
                    <TextField
                        required
                        fullWidth
                        id="id"
                        name="id"
                        label="Product ID"
                        variant="outlined"
                        onChange={handleInput}
                        value={product.id}
                    />
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
                            id="price"
                            name="price"
                            label="Price (Rp)"
                            variant="outlined"
                            type="text" // ⬅️ Tetap TEXT untuk memformat
                            value={formatRupiah(product.price)} // ⬅️ Nilai Diformat
                            onChange={handleInput} // ⬅️ Menggunakan handler yang disederhanakan
                            inputProps={{inputMode: "numeric"}}
                        />

                        {/* STOCK: Menggunakan handleInput */}
                        <TextField
                            required
                            fullWidth
                            id="stock"
                            name="stock"
                            label="Stock Quantity"
                            variant="outlined"
                            type="text" // Diubah ke 'text' juga agar handleInput seragam, meski Number bisa
                            value={product.stock}
                            onChange={handleInput}
                            inputProps={{inputMode: "numeric", pattern: "[0-9]*"}}
                        />
                        {/* 💡 SELECT UNTUK QUANTITY TYPE */}
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
