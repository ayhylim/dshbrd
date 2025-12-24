import {Box, Button, TextField, Stack, Typography, IconButton} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {useState, useContext, useEffect, useMemo} from "react";
import Select from "react-select";
import {fetchProduct} from "../../../api/api";
import ProductContext from "../inventory/context/ProductContext";

const initialOrderValue = {
    customer: ""
};

const initialProductItem = {
    selectedOption: null,
    productAmount: 0
};

export default function AddOrderModal() {
    const {fetchDataOrderAPI, onCreateOrderProduct, getProductStock} = useContext(ProductContext);
    const [productOptions, setProductOptions] = useState([]);
    const [orderInputs, setOrderInputs] = useState(initialOrderValue);
    const [orderProducts, setOrderProducts] = useState([initialProductItem]);

    const selectedProductNames = useMemo(() => {
        return new Set(orderProducts.map(item => item.selectedOption?.label).filter(name => name));
    }, [orderProducts]);

    const handleAddProductField = () => {
        setOrderProducts(prev => [...prev, initialProductItem]);
    };

    const handleDeleteProductField = index => {
        setOrderProducts(prev => prev.filter((_, i) => i !== index));
    };

    const handleProductChange = (index, name, value) => {
        setOrderProducts(prev => prev.map((item, i) => (i === index ? {...item, [name]: value} : item)));
    };

    // 💡 UBAH: Handler untuk QTY yang mendukung float
    const handleQtyChange = (index, e) => {
        const {value} = e.target;

        // 💡 Terima angka desimal
        const rawValue = value.replace(/[^0-9.]/g, "");

        // Validasi: hanya boleh 1 titik
        const dotCount = (rawValue.match(/\./g) || []).length;
        if (dotCount > 1) return;

        // Validasi: tidak boleh negatif
        const numValue = parseFloat(rawValue);
        if (!isNaN(numValue) && numValue < 0) return;

        handleProductChange(index, "productAmount", rawValue);
    };

    const handleSubmit = async e => {
        e.preventDefault();

        const customerName = orderInputs.customer;
        const productsToOrder = [];
        let validationFailed = false;

        const uniqueProducts = new Set();

        for (const item of orderProducts) {
            const productName = item.selectedOption ? item.selectedOption.label : null;
            const productAmount = parseFloat(item.productAmount); // 💡 UBAH: parseFloat untuk desimal

            if (!customerName || orderProducts.length === 0 || !productName || productAmount <= 0) {
                alert("Harap lengkapi semua field yang diperlukan (Pelanggan, Produk, dan Jumlah > 0).");
                validationFailed = true;
                break;
            }

            if (isNaN(productAmount)) {
                alert("Jumlah produk harus berupa angka valid!");
                validationFailed = true;
                break;
            }

            if (uniqueProducts.has(productName)) {
                alert(
                    `Produk "${productName}" sudah dipilih. Harap hapus duplikasi atau tambahkan QTY di baris yang sudah ada.`
                );
                validationFailed = true;
                break;
            }
            uniqueProducts.add(productName);

            const availableStock = getProductStock(productName);
            if (productAmount > availableStock) {
                alert(
                    `Demand melebihi supply! Produk "${productName}" hanya tersedia ${availableStock} unit. Order dibatalkan.`
                );
                validationFailed = true;
                break;
            }

            productsToOrder.push({
                productName: productName,
                productAmount: productAmount
            });
        }

        if (validationFailed) {
            return;
        }

        const finalOrderData = {
            customer: customerName,
            dateCreated: new Date().toISOString(),
            products: productsToOrder
        };

        try {
            await onCreateOrderProduct(finalOrderData);
            await fetchDataOrderAPI();

            setOrderInputs(initialOrderValue);
            setOrderProducts([initialProductItem]);

            console.log("--- ORDER DIBUAT ---");
        } catch (error) {
            console.error("Gagal membuat order:", error);
            alert("Terjadi kesalahan saat memproses order.");
        }
    };

    const handleChange = e => {
        const {name, value} = e.target;

        setOrderInputs(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const loadProductOptions = async () => {
        try {
            const datas = await fetchProduct();
            const optionList = datas.map(data => {
                return {
                    value: data.id,
                    label: data.productName
                };
            });
            setProductOptions(optionList);
        } catch (error) {
            console.error("Failed to load product options:", error);
        }
    };

    useEffect(() => {
        loadProductOptions();
        fetchDataOrderAPI();
    }, []);

    const isSubmitDisabled = orderProducts.some(item => {
        const productName = item.selectedOption?.label;
        const amount = parseFloat(item.productAmount); // 💡 UBAH: parseFloat
        const availableStock = productName ? getProductStock(productName) : Infinity;
        return amount <= 0 || isNaN(amount) || amount > availableStock || !productName;
    });

    return (
        <Box
            sx={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: {xs: "90%", sm: "70%", md: "60%"},
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 24,
                p: 4
            }}
        >
            <Typography variant="h5" component="h2" gutterBottom>
                Tambah Order Baru
            </Typography>

            <Box component="form" onSubmit={handleSubmit} autoComplete="off">
                <Stack spacing={3}>
                    <TextField
                        required
                        fullWidth
                        id="customer"
                        name="customer"
                        label="Customer"
                        variant="outlined"
                        value={orderInputs.customer}
                        onChange={handleChange}
                    />

                    <Typography variant="subtitle1" sx={{mt: 2, mb: 1}}>
                        Detail Produk:
                    </Typography>

                    <Stack spacing={2}>
                        {orderProducts.map((item, index) => {
                            const productName = item.selectedOption?.label;
                            const currentStock = productName ? getProductStock(productName) : null;
                            const isStockInsufficient =
                                currentStock !== null && parseFloat(item.productAmount) > currentStock;

                            const currentOptions = productOptions.filter(
                                option => !selectedProductNames.has(option.label) || option.label === productName
                            );

                            return (
                                <div key={index} className="product-selection-field">
                                    <Stack direction="row" spacing={1} alignItems="flex-start">
                                        {/* QTY Field - 💡 UBAH: Support float */}
                                        <TextField
                                            required
                                            id={`qty-${index}`}
                                            name="productAmount"
                                            label="QTY (Integer atau Desimal)"
                                            variant="outlined"
                                            type="text"
                                            onChange={e => handleQtyChange(index, e)}
                                            value={item.productAmount}
                                            placeholder="Contoh: 5 atau 5.5"
                                            helperText="Contoh: 10 atau 10.5"
                                            inputProps={{inputMode: "decimal", pattern: "[0-9.]*"}}
                                            sx={{width: "15%"}}
                                        />

                                        {/* Product Select */}
                                        <div style={{width: "70%"}}>
                                            <Select
                                                options={currentOptions}
                                                value={item.selectedOption}
                                                onChange={option =>
                                                    handleProductChange(index, "selectedOption", option)
                                                }
                                                isSearchable={true}
                                                placeholder="Select Product"
                                                isClearable={false}
                                            />
                                            {currentStock !== null && (
                                                <Typography
                                                    variant="caption"
                                                    color={isStockInsufficient ? "error" : "textSecondary"}
                                                    sx={{mt: 0.5, display: "block"}}
                                                >
                                                    Stok Tersedia: **{currentStock}**
                                                </Typography>
                                            )}
                                        </div>

                                        {/* Tombol Delete */}
                                        <IconButton
                                            onClick={() => handleDeleteProductField(index)}
                                            color="error"
                                            aria-label="delete product item"
                                            disabled={orderProducts.length === 1}
                                            sx={{mt: 0.5}}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Stack>
                                </div>
                            );
                        })}
                    </Stack>

                    <Button
                        onClick={handleAddProductField}
                        variant="outlined"
                        sx={{mt: 2, width: "100%"}}
                        disabled={productOptions.length === orderProducts.length}
                    >
                        Tambah Produk Lain
                    </Button>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{mt: 3}}
                        disabled={isSubmitDisabled}
                    >
                        Order Produk
                    </Button>

                    {isSubmitDisabled && (
                        <Typography color="error" align="center">
                            ** Harap isi semua kolom dan pastikan QTY tidak melebihi stok tersedia. **
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Box>
    );
}
