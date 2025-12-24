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

// 💡 UBAH: Logika untuk mendeteksi produk yang butuh supply dengan threshold float
const checkSupplyNeeds = (products, getDemandFunction) => {
    // 💡 UBAH: Threshold sekarang bisa float
    const CRITICAL_STOCK_THRESHOLD = 50.5; // Contoh: 50.5 unit
    const HIGH_DEMAND_THRESHOLD = 500.0; // Contoh: 500.0 unit

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
    const {product, fetchDataAPI, order, fetchDataOrderAPI, getProductDemand} = useContext(ProductContext);

    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [smartNotifications, setSmartNotifications] = useState([]);
    const userInfo = getUserFromToken();

    const [dismissedNotifications, setDismissedNotifications] = useState([]);

    const open = Boolean(anchorEl);
    const notificationOpen = Boolean(notificationAnchorEl);

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

    const handleDismissNotification = id => {
        setDismissedNotifications(prev => [...prev, id]);
    };

    useEffect(() => {
        if (product.length === 0) fetchDataAPI();
        if (order.length === 0) fetchDataOrderAPI();

        const allAlerts = checkSupplyNeeds(product, getProductDemand);
        const filteredAlerts = allAlerts.filter(alert => !dismissedNotifications.includes(alert.id));

        setSmartNotifications(filteredAlerts);
    }, [product, order, getProductDemand, fetchDataAPI, fetchDataOrderAPI, dismissedNotifications]);

    const totalNotifications = smartNotifications.length;

    const handleSupplyAction = productName => {
        alert(`Aksi Supply untuk produk ${productName} telah dipicu.`);
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
                                        <Badge variant="dot" color="error" invisible={totalNotifications === 0}>
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
                            </Box>
                        </Container>
                    </AppBar>
                </Paper>
            </Grid>
        </Grid>
    );
}
