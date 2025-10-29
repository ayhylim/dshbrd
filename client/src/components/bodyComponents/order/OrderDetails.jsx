import {Delete, DeleteOutline} from "@mui/icons-material";
import {
    Box,
    Button,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {useContext} from "react";
import ProductContext from "../inventory/context/ProductContext";

export default function OrderDetails({order}) {
    const {getProductStock} = useContext(ProductContext);

    if (!order || !order.customer || !order.products || order.products.length === 0) {
        return (
            <Box
                sx={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "50%",
                    bgcolor: "white",
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4
                }}
            >
                <Typography variant="h6" sx={{m: 3}}>
                    Order Details
                </Typography>
                <Typography sx={{m: 3}}>Loading or No order details available...</Typography>
            </Box>
        );
    }
    console.log("Customer name is:\n", order.customer);

    const handleDeleteProductFromOrder = (orderId, productName) => {
        // Logika untuk menghapus produk dari pesanan
        console.log("delete the product : ", productName, " from the order ", orderId);
    };

    const tableRows = order.products.map((orderProduct, index) => {
        // 🔍 Hitung stok yang tersedia secara real-time
        const availableStock = getProductStock(orderProduct.productName);
        return (
            <TableRow key={index}>
                <TableCell>{orderProduct.productName}</TableCell>
                <TableCell>{orderProduct.productAmount}</TableCell>
                <TableCell>{availableStock}</TableCell>
                <TableCell>
                    {/* <IconButton onClick={() => handleDeleteProductFromOrder(order.id, orderProduct.productName)}>
                        <DeleteOutline color="error" />
                    </IconButton> */}
                </TableCell>
            </TableRow>
        );
    });
    console.log(tableRows);
    return (
        <Box
            sx={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "50%",
                bgcolor: "white",
                borderRadius: 2,
                boxShadow: 24,
                p: 4
            }}
        >
            <Box sx={{color: "black", display: "flex", flexDirection: "column"}}>
                <Typography variant="h6" sx={{m: 3}}>
                    Order Details
                </Typography>
                {/* Tampilkan Nama Customer */}
                <Paper
                    elevation={0}
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "30%",
                        m: 3
                    }}
                >
                    <Typography variant="subtitle1">Customer Name </Typography>
                    <Typography variant="subtitle1" color={"grey"}>
                        {order.customer}
                    </Typography>
                </Paper>
                {/* Hapus atau ganti tampilan data statis "Position" dan "Mobile" jika tidak relevan */}
                {/* ... (Paper untuk Position) */}
                {/* ... (Paper untuk Mobile) */}
                <Box>
                    <TableContainer sx={{marginBottom: 3}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product Name</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Stock Availability</TableCell> <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>{tableRows} </TableBody>
                        </Table>
                    </TableContainer>
                    {/* ... (Buttons Reject/Approve) */}
                </Box>
            </Box>
        </Box>
    );
}
