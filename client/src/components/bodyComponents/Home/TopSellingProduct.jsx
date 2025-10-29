// #TopSellingProduct.jsx (LENGKAP)

import {useContext, useMemo, useEffect} from "react";
// 💡 ASUMSI: Import library UI (sesuaikan dengan project Anda)
import {Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody} from "@mui/material";
import ProductContext from "../inventory/context/ProductContext";

export default function TopSellingProduct() {
    // 1. Ambil data dari context
    const {product, transactionLog, fetchDataAPI, fetchDataOrderAPI, fetchTransactionLogAPI} =
        useContext(ProductContext);

    // Fetch data saat komponen dimuat
    useEffect(() => {
        fetchDataAPI();
        fetchDataOrderAPI();
        fetchTransactionLogAPI();
    }, [fetchDataAPI, fetchDataOrderAPI, fetchTransactionLogAPI]);

    const topSellingProducts = useMemo(() => {
        const salesMap = {};

        // 1. Hitung total QTY terjual dari semua LOG TRANSAKSI
        transactionLog.forEach(log => {
            if (log.products) {
                log.products.forEach(p => {
                    const name = p.productName;
                    const amount = Number(p.productAmount);

                    if (name && amount > 0) {
                        salesMap[name] = (salesMap[name] || 0) + amount;
                    }
                });
            }
        });

        // 2. Gabungkan data QTY terjual dengan detail produk
        const combinedData = product
            .map(pData => {
                const productName = pData.productName;
                const totalSold = salesMap[productName] || 0;
                // ASUMSI: price ada di data produk utama, tapi kita juga cek di log.products
                const price = Number(pData.price);

                // Hanya sertakan produk yang pernah terjual
                if (totalSold > 0) {
                    // Cari harga dari log terakhir atau gunakan harga produk utama
                    const totalAmount = price * totalSold;

                    return {
                        name: productName,
                        quantity: totalSold,
                        price: price,
                        amount: totalAmount,
                        stock: pData.stock
                    };
                }
                return null;
            })
            .filter(item => item !== null);

        // 3. Urutkan berdasarkan Quantity (QTY) dan ambil 5 teratas
        return combinedData.sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    }, [product, transactionLog]);

    return (
        <Box
            sx={{
                margin: 3,
                bgcolor: "white",
                borderRadius: 2,
                padding: 3,
                height: "95%"
            }}
        >
            <Typography variant="h6" fontWeight={"bold"} sx={{mx: 3}}>
                Top 5 Produk Terlaris
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nama Produk</TableCell>
                            <TableCell>QTY Terjual</TableCell>
                            <TableCell>Harga Satuan</TableCell>
                            <TableCell>Total Penjualan</TableCell>
                            <TableCell>Stok Saat Ini</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {topSellingProducts.map((p, index) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>{p.quantity}</TableCell>
                                    {/* Format mata uang Rupiah */}
                                    <TableCell>Rp {p.price ? Number(p.price).toLocaleString("id-ID") : 0}</TableCell>
                                    <TableCell>Rp {p.amount ? p.amount.toLocaleString("id-ID") : 0}</TableCell>
                                    <TableCell>{p.stock}</TableCell>
                                </TableRow>
                            );
                        })}
                        {topSellingProducts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    Belum ada produk yang **terjual (Accepted Order)**.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
