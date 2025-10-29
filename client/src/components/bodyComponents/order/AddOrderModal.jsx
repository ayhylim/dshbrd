// #AddOrderModal.jsx (Kode yang Direvisi untuk Mencegah Duplikasi Produk)

import {Box, Button, TextField, Stack, Typography, IconButton} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {useState, useContext, useEffect, useMemo} from "react"; // 💡 Import useMemo
import Select from "react-select";
import {fetchProduct} from "../../../api/api"; // Hapus fetchOrderProduct karena tidak digunakan di sini
import ProductContext from "../inventory/context/ProductContext";

// Initial state
const initialOrderValue = {
    customer: ""
};

// Struktur awal untuk satu item produk
const initialProductItem = {
    selectedOption: null, // { value: id, label: productName }
    productAmount: 0 // QTY produk
};

export default function AddOrderModal() {
    const {fetchDataOrderAPI, onCreateOrderProduct, getProductStock} = useContext(ProductContext);
    const [productOptions, setProductOptions] = useState([]);
    const [orderInputs, setOrderInputs] = useState(initialOrderValue);
    const [orderProducts, setOrderProducts] = useState([initialProductItem]);

    // -----------------------------------------------------------------------
    // 💡 LOGIKA BARU: MENGHITUNG PRODUK YANG SUDAH DIPILIH
    // -----------------------------------------------------------------------
    const selectedProductNames = useMemo(() => {
        // Buat Set dari nama produk yang telah dipilih di semua baris input
        return new Set(
            orderProducts.map(item => item.selectedOption?.label).filter(name => name) // Filter out null/undefined names
        );
    }, [orderProducts]);

    // -----------------------------------------------------------------------
    // HANDLERS UNTUK MENGELOLA ARRAY PRODUK
    // -----------------------------------------------------------------------

    const handleAddProductField = () => {
        // Menambah item produk baru ke dalam array orderProducts
        setOrderProducts(prev => [...prev, initialProductItem]);
    };

    const handleDeleteProductField = index => {
        // Menghapus item produk pada index tertentu
        setOrderProducts(prev => prev.filter((_, i) => i !== index));
    };

    const handleProductChange = (index, name, value) => {
        // Update QTY (productAmount) atau Select Option (selectedOption) pada index tertentu
        setOrderProducts(prev => prev.map((item, i) => (i === index ? {...item, [name]: value} : item)));
    };

    // -----------------------------------------------------------------------
    // SUBMIT ORDER
    // -----------------------------------------------------------------------
    const handleSubmit = async e => {
        e.preventDefault();

        const customerName = orderInputs.customer;
        const productsToOrder = [];
        let validationFailed = false;

        // 1. Validasi Duplikasi Produk di tahap Submit (jika ada bug di filter UI)
        // Walaupun UI sudah difilter, ini adalah lapisan keamanan tambahan.
        const uniqueProducts = new Set();

        for (const item of orderProducts) {
            const productName = item.selectedOption ? item.selectedOption.label : null;
            const productAmount = Number(item.productAmount);

            // Validasi Dasar dan Kelengkapan Input
            if (!customerName || orderProducts.length === 0 || !productName || productAmount <= 0) {
                alert("Harap lengkapi semua field yang diperlukan (Pelanggan, Produk, dan Jumlah > 0).");
                validationFailed = true;
                break;
            }

            // 💡 Validasi Duplikasi Produk
            if (uniqueProducts.has(productName)) {
                alert(
                    `Produk "${productName}" sudah dipilih. Harap hapus duplikasi atau tambahkan QTY di baris yang sudah ada.`
                );
                validationFailed = true;
                break;
            }
            uniqueProducts.add(productName);

            // Validasi Stok
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

        // 3. Jika semua validasi lolos, buat data final
        const finalOrderData = {
            customer: customerName,
            dateCreated: new Date().toISOString(),
            products: productsToOrder
        };

        try {
            await onCreateOrderProduct(finalOrderData);
            await fetchDataOrderAPI();

            // Reset form setelah berhasil
            setOrderInputs(initialOrderValue);
            setOrderProducts([initialProductItem]);

            console.log("--- ORDER DIBUAT ---");
        } catch (error) {
            console.error("Gagal membuat order:", error);
            alert("Terjadi kesalahan saat memproses order.");
        }
    };
    // -----------------------------------------------------------------------

    const handleChange = e => {
        const {name, value} = e.target;

        setOrderInputs(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Helper untuk fetch product options (tidak berubah)
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

    // Helper untuk menampilkan pesan error di tombol Submit
    const isSubmitDisabled = orderProducts.some(item => {
        const productName = item.selectedOption?.label;
        const amount = Number(item.productAmount);
        const availableStock = productName ? getProductStock(productName) : Infinity;
        return amount <= 0 || amount > availableStock || !productName; // 💡 Disabled jika produk belum dipilih
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
                    {/* Customer Name */}
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

                    {/* Header Produk (opsional) */}
                    <Typography variant="subtitle1" sx={{mt: 2, mb: 1}}>
                        Detail Produk:
                    </Typography>

                    {/* 🔄 Mapping Array Produk yang Dinamis */}
                    <Stack spacing={2}>
                        {orderProducts.map((item, index) => {
                            const productName = item.selectedOption?.label;
                            const currentStock = productName ? getProductStock(productName) : null;
                            const isStockInsufficient =
                                currentStock !== null && Number(item.productAmount) > currentStock;

                            // 💡 Opsi untuk baris ini: Gabungkan semua opsi yang belum dipilih
                            // Ditambah opsi yang saat ini dipilih (untuk menjaga nilai yang sudah ada)
                            const currentOptions = productOptions.filter(
                                option => !selectedProductNames.has(option.label) || option.label === productName
                            );

                            return (
                                <div key={index} className="product-selection-field">
                                    <Stack direction="row" spacing={1} alignItems="flex-start">
                                        {/* QTY Field */}
                                        <TextField
                                            required
                                            id={`qty-${index}`}
                                            name="productAmount"
                                            label="QTY"
                                            variant="outlined"
                                            type="number"
                                            onChange={e => handleProductChange(index, "productAmount", e.target.value)}
                                            value={item.productAmount}
                                            inputProps={{inputMode: "numeric", pattern: "[0-9]*", min: 1}}
                                            sx={{width: "15%"}}
                                        />

                                        {/* Product Select */}
                                        <div style={{width: "70%"}}>
                                            <Select
                                                // 💡 MENGGUNAKAN OPSI YANG SUDAH DIFILTER
                                                options={currentOptions}
                                                value={item.selectedOption}
                                                onChange={option =>
                                                    handleProductChange(index, "selectedOption", option)
                                                }
                                                isSearchable={true}
                                                placeholder="Select Product"
                                                isClearable={false}
                                            />
                                            {/* Info Stok Tersedia */}
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
                                            // Jangan izinkan menghapus jika hanya tersisa 1 baris
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

                    {/* Tombol Add Product (Disable jika semua produk sudah dipilih) */}
                    <Button
                        onClick={handleAddProductField}
                        variant="outlined"
                        sx={{mt: 2, width: "100%"}}
                        disabled={productOptions.length === orderProducts.length} // 💡 DISABLE JIKA SEMUA OPSI TELAH DIGUNAKAN
                    >
                        Tambah Produk Lain
                    </Button>

                    {/* Submit Button */}
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

                    {/* 🚨 Tampilkan Pesan Error di bawah tombol jika stok kurang/input kurang */}
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
