import {Box, Button, TextField, Stack, Typography, InputLabel, Select, FormControl, MenuItem} from "@mui/material";
import {useState, useContext, useCallback} from "react";
import ProductContext from "./context/ProductContext";
import {getRoleFromToken} from "../../../utils/getRoleFromToken";

const initialValue = {
    id: "",
    productName: "",
    category: "",
    stock: "",
    quantityType: ""
};

const formatRupiah = numberString => {
    const rawValue = String(numberString).replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("id-ID").format(Number(rawValue));
};

const useInputHandler = (product, setProduct) => {
    return useCallback(
        e => {
            const {name, value} = e.target;

            if (name === "stock") {
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

export default function AddProduct() {
    const [product, setProduct] = useState(initialValue);
    const {onCreateProduct} = useContext(ProductContext);
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

        const finalProduct = {
            ...product,
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
                            id="stock"
                            name="stock"
                            label="Stock Quantity"
                            variant="outlined"
                            type="text"
                            value={product.stock}
                            onChange={handleInput}
                            inputProps={{inputMode: "numeric", pattern: "[0-9]*"}}
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
