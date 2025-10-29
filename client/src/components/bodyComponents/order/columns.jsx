// #columns.jsx (REVISI)

import {Button, Box, Typography} from "@mui/material"; // Tambahkan Box dan Typography
import OrderProfile from "./OrderProfile";

// 💡 Terima prop baru: onStatusChange
export const columns = (handleOrderDetail, onStatusChange) => [
    {
        field: "rowNumber",
        headerName: "No",
        width: 60, // Lebar dikurangi
        description: "Sequential row number",
        sortable: false,
        filterable: false
    },
    {
        field: "fullname",
        headerName: "Customer",
        width: 180, // Lebar disesuaikan
        description: "customer name data",
        renderCell: params => {
            return <OrderProfile custName={params.row.customer} />;
        }
    },
    {
        field: "total",
        headerName: "Total QTY",
        width: 100, // Lebar disesuaikan
        description: "total quantity of all products in the order",
        valueGetter: params => {
            const orderProducts = params.row.products;
            if (!orderProducts || orderProducts.length === 0) {
                return 0;
            }
            const totalQuantity = orderProducts.reduce((sum, productItem) => {
                const amount = Number(productItem.productAmount);
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0);
            return totalQuantity;
        }
    },
    // 💡 KOLOM STATUS BARU
    {
        field: "status",
        headerName: "Status & Aksi",
        width: 380, // Beri lebar cukup untuk tombol
        description: "Order status and action buttons",
        renderCell: params => {
            const order = params.row;
            const status = order.status || "Pending"; // Default: Pending
            const isAccepted = status === "Accepted";
            const isDeclined = status === "Declined";

            return (
                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: "bold",
                            minWidth: "70px",
                            color: isAccepted ? "green" : isDeclined ? "red" : "orange"
                        }}
                    >
                        {status.toUpperCase()}
                    </Typography>

                    {/* Tombol ACCEPT */}
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        disabled={isAccepted || isDeclined} // Nonaktif jika sudah Accepted/Declined
                        onClick={() => onStatusChange(order.id, "Accepted")}
                    >
                        Accept
                    </Button>

                    {/* Tombol DECLINE */}
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        disabled={isAccepted || isDeclined} // Nonaktif jika sudah Accepted/Declined
                        onClick={() => onStatusChange(order.id, "Declined")}
                    >
                        Decline
                    </Button>
                </Box>
            );
        }
    },
    // Kolom Order Details (ditempatkan di akhir)
    {
        field: "details",
        headerName: "Details",
        width: 120,
        description: "the details of the order",
        renderCell: params => {
            const order = params.row;
            return (
                <Button
                    variant="contained"
                    sx={{bgcolor: "#504099"}}
                    size="small"
                    onClick={() => handleOrderDetail(order)}
                >
                    Details
                </Button>
            );
        }
    }
];
