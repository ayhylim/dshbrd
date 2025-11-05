import {Box, Button, TextField, Stack, Typography} from "@mui/material";
import {useState, useContext, useEffect} from "react";
import ProductContext from "./context/ProductContext";
import {editProduct} from "../../../api/api";
import axios from "axios";

const formatRupiah = numberString => {
    const rawValue = String(numberString).replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("id-ID").format(Number(rawValue));
};

export default function PurchasingPriceModal({productToEdit, onClose}) {
    const {setProduct} = useContext(ProductContext);

    const [prices, setPrices] = useState({
        price: "",
        hargaModal: ""
    });

    const [fullData, setFullData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // 🟢 FETCH FULL DATA from backend when modal opens
    useEffect(() => {
        if (productToEdit) {
            console.log("🔄 [PurchasingPriceModal] Fetching FULL data from backend for product:", productToEdit.id);
            setIsLoading(true);

            axios
                .get(`http://127.0.0.1:3001/productList`)
                .then(response => {
                    const fullProduct = response.data.find(p => p.id === productToEdit.id);

                    if (fullProduct) {
                        console.log("✅ [PurchasingPriceModal] FULL data received from backend:", fullProduct);

                        setFullData(fullProduct);
                        setPrices({
                            price: String(fullProduct.price || 0),
                            hargaModal: String(fullProduct.hargaModal || 0)
                        });
                    } else {
                        console.warn("⚠️ [PurchasingPriceModal] Product not found in backend, using UI data");
                        setFullData(productToEdit);
                        setPrices({
                            price: String(productToEdit.price || 0),
                            hargaModal: String(productToEdit.hargaModal || 0)
                        });
                    }
                })
                .catch(error => {
                    console.error("❌ [PurchasingPriceModal] Error fetching data:", error);
                    setFullData(productToEdit);
                    setPrices({
                        price: String(productToEdit.price || 0),
                        hargaModal: String(productToEdit.hargaModal || 0)
                    });
                })
                .finally(() => setIsLoading(false));
        }
    }, [productToEdit]);

    const handlePriceChange = e => {
        const {name, value} = e.target;
        const rawValue = value.replace(/\D/g, "");
        setPrices(prev => ({
            ...prev,
            [name]: rawValue
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);

        if (!productToEdit || !fullData) {
            setIsLoading(false);
            return;
        }

        // 🟢 SEND FULL DATA (purchasing update only price & hargaModal, but send everything)
        const finalData = {
            id: fullData.id,
            productName: fullData.productName,
            category: fullData.category,
            stock: fullData.stock,
            quantityType: fullData.quantityType,
            price: Number(prices.price || 0),
            hargaModal: Number(prices.hargaModal || 0)
        };

        console.log("📤 [PurchasingPriceModal] Sending FULL data:", finalData);

        try {
            const updatedProduct = await editProduct(productToEdit.id, finalData);

            console.log("✅ [PurchasingPriceModal] Updated product from backend:", updatedProduct);

            setProduct(prev => prev.map(p => (p.id === productToEdit.id ? updatedProduct : p)));

            alert(`Harga untuk ${productToEdit.productName} berhasil diperbarui!`);
            onClose();
        } catch (err) {
            console.error("❌ [PurchasingPriceModal] Error:", err);
            alert("Terjadi error saat memperbarui harga.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!fullData) {
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
                <Typography>Loading...</Typography>
            </Box>
        );
    }

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
                Set Harga: {fullData?.productName}
            </Typography>

            <Box component="form" onSubmit={handleSubmit} autoComplete="off">
                <Stack spacing={3}>
                    <Box sx={{p: 2, bgcolor: "#f5f5f5", borderRadius: 1}}>
                        <Typography variant="body2" color="textSecondary">
                            Product ID: <strong>{fullData?.id}</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{mt: 1}}>
                            Category: <strong>{fullData?.category}</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{mt: 1}}>
                            Stock:{" "}
                            <strong>
                                {fullData?.stock} {fullData?.quantityType}
                            </strong>
                        </Typography>
                    </Box>

                    <TextField
                        required
                        fullWidth
                        id="hargaModal"
                        name="hargaModal"
                        label="Harga Modal (Rp)"
                        variant="outlined"
                        type="text"
                        value={formatRupiah(prices.hargaModal)}
                        onChange={handlePriceChange}
                        inputProps={{inputMode: "numeric"}}
                    />

                    <TextField
                        required
                        fullWidth
                        id="price"
                        name="price"
                        label="Harga Jual (Rp)"
                        variant="outlined"
                        type="text"
                        value={formatRupiah(prices.price)}
                        onChange={handlePriceChange}
                        inputProps={{inputMode: "numeric"}}
                    />

                    {prices.price && prices.hargaModal && (
                        <Box sx={{p: 2, bgcolor: "#e8f5e9", borderRadius: 1}}>
                            <Typography variant="body2" color="success.main">
                                <strong>Margin Keuntungan:</strong> Rp{" "}
                                {(Number(prices.price) - Number(prices.hargaModal)).toLocaleString("id-ID")}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                (
                                {(
                                    ((Number(prices.price) - Number(prices.hargaModal)) / Number(prices.hargaModal)) *
                                    100
                                ).toFixed(1)}
                                %)
                            </Typography>
                        </Box>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{mt: 3}}
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save Prices"}
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
