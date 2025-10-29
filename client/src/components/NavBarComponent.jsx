// #NavbarComponent.jsx (Revisi Final dengan Tombol OK/Hapus Notifikasi Dinamis)

import {
    Box,
    Grid,
    AppBar,
    Container,
    Typography,
    Paper,
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Divider,
    Button
} from "@mui/material";
import {NotificationsOutlined} from "@mui/icons-material";
import {useState, useEffect, useContext} from "react";
import ProductContext from "./bodyComponents/inventory/context/ProductContext";
import Logo from "../../public/pictures/logo.jpg";
import {getUserFromToken} from "../utils/getRoleFromToken";

// Logika untuk mendeteksi produk yang butuh supply
const checkSupplyNeeds = (products, getDemandFunction) => {
    // Tentukan kriteria Anda di sini
    const CRITICAL_STOCK_THRESHOLD = 50;
    const HIGH_DEMAND_THRESHOLD = 500;

    return products
        .map(p => {
            const demand = getDemandFunction(p.productName);
            return {
                ...p,
                totalDemand: demand
            };
        })
        .filter(p => p.stock < CRITICAL_STOCK_THRESHOLD && p.totalDemand > HIGH_DEMAND_THRESHOLD)
        .map(p => ({
            id: p.id,
            productName: p.productName,
            message: `Supply produk ${p.productName} karena stok tersisa ${p.stock} dengan demand tinggi (${p.totalDemand} terjual).`
        }));
};

export default function NavBarComponent() {
    // Ambil state dan fungsi dari Context
    const {product, fetchDataAPI, order, fetchDataOrderAPI, getProductDemand} = useContext(ProductContext);

    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [smartNotifications, setSmartNotifications] = useState([]);
    const userInfo = getUserFromToken();

    // 💡 STATE BARU: Untuk menyimpan notifikasi dinamis yang sudah dikonfirmasi/dihapus (oleh user)
    // Di dunia nyata, ini akan disimpan di server atau LocalStorage.
    const [dismissedNotifications, setDismissedNotifications] = useState([]);

    const open = Boolean(anchorEl);
    const notificationOpen = Boolean(notificationAnchorEl);

    // ... (handle function tetap sama)
    const handleAvatarClicked = event => {
        setAnchorEl(event.currentTarget);
    };
    const handleNotificationClicked = event => {
        setNotificationAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const notificationHandleClose = () => {
        setNotificationAnchorEl(null);
    };

    // 💡 FUNGSI BARU: Menghapus notifikasi dinamis (tombol OK)
    const handleDismissNotification = id => {
        // 1. Tambahkan ID notifikasi ke daftar yang di-dismiss
        setDismissedNotifications(prev => [...prev, id]);
        // 2. Tutup menu notifikasi (opsional, tergantung UX)
        // notificationHandleClose();
    };

    useEffect(() => {
        // Ambil data produk dan order saat Navbar dimuat (jika belum dimuat)
        if (product.length === 0) fetchDataAPI();
        if (order.length === 0) fetchDataOrderAPI();

        // 1. Cek kebutuhan supply
        const allAlerts = checkSupplyNeeds(product, getProductDemand);

        // 2. Filter alerts, hanya tampilkan yang BELUM di-dismiss
        const filteredAlerts = allAlerts.filter(alert => !dismissedNotifications.includes(alert.id));

        setSmartNotifications(filteredAlerts);
    }, [product, order, getProductDemand, fetchDataAPI, fetchDataOrderAPI, dismissedNotifications]);

    // 💡 Hitung total notifikasi yang BELUM di-dismiss
    const totalNotifications = smartNotifications.length;

    // Fungsi Aksi (Supply Produk)
    const handleSupplyAction = productName => {
        alert(`Aksi Supply untuk produk ${productName} telah dipicu.`);
        // Di sini Anda bisa memanggil handleDismissNotification jika supply berhasil
    };

    return (
        <Grid container>
            <Grid item md={12}>
                <Paper elevation={4}>
                    <AppBar sx={{padding: 2}} position="static">
                        <Container maxWidth="xxl">
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                {/* ... (Nav-left tetap sama) */}
                                <div className="nav-left" style={{display: "flex", alignItems: "center"}}>
                                    <img
                                        src={Logo}
                                        alt=""
                                        style={{width: "4rem", height: "auto", borderRadius: "100px"}}
                                    />
                                    <Typography
                                        variant="h6"
                                        component="a"
                                        href="/home"
                                        fontFamily={"Inter"}
                                        sx={{
                                            mx: 2,
                                            display: {xs: "none", md: "flex"},
                                            fontWeight: 700,
                                            letterSpacing: ".2rem",
                                            color: "inherit",
                                            textDecoration: "none"
                                        }}
                                    >
                                        Tyotech Mandiri Jaya | Dashboard
                                    </Typography>
                                </div>

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "right",
                                        alignItems: "center"
                                    }}
                                >
                                    <IconButton color="inherit">
                                        <Badge
                                            variant="dot"
                                            color="error"
                                            // Badge hilang jika totalNotifications adalah 0
                                            invisible={totalNotifications === 0}
                                        >
                                            <NotificationsOutlined
                                                sx={{width: 32, height: 32}}
                                                onClick={handleNotificationClicked}
                                            />
                                        </Badge>
                                    </IconButton>
                                    <Menu
                                        open={notificationOpen}
                                        anchorEl={notificationAnchorEl}
                                        onClose={notificationHandleClose}
                                        anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                                        transformOrigin={{vertical: "top", horizontal: "right"}}
                                        sx={{
                                            "& .MuiMenu-paper": {
                                                width: "400px",
                                                maxWidth: "none"
                                            }
                                        }}
                                    >
                                        {/* 💡 Notifikasi Dinamis (Rekomendasi Supply) */}
                                        {smartNotifications.map(notification => (
                                            <Box key={notification.id}>
                                                <MenuItem
                                                    sx={{
                                                        flexDirection: "column",
                                                        alignItems: "flex-start",
                                                        padding: 1,
                                                        backgroundColor: "#ffe0e0",
                                                        marginBottom: "4px"
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{fontWeight: "bold", color: "error.main"}}
                                                    >
                                                        ⚠️ Aksi Supply Diperlukan
                                                    </Typography>
                                                    <Typography variant="body2" sx={{whiteSpace: "normal", mb: 1}}>
                                                        {notification.message}
                                                    </Typography>
                                                    <Box sx={{display: "flex", gap: 1}}>
                                                        {/* 💡 TOMBOL KONFIRMASI (OK) */}
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            size="small"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                handleDismissNotification(notification.id);
                                                            }}
                                                        >
                                                            OK / Hapus
                                                        </Button>
                                                    </Box>
                                                </MenuItem>
                                                <Divider />
                                            </Box>
                                        ))}
                                    </Menu>
                                    <Typography fontFamily={"Inter"}>
                                        {" "}
                                        {userInfo?.name || "User"} ({userInfo?.role?.toUpperCase() || "N/A"})
                                    </Typography>
                                </Box>
                                {/* ... (Menu profile tetap sama) */}
                            </Box>
                        </Container>
                    </AppBar>
                </Paper>
            </Grid>
        </Grid>
    );
}
