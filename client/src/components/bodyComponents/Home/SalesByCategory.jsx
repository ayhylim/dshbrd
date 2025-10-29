import {useContext, useMemo, useEffect  } from "react";
import {Box, Typography} from "@mui/material";
import ApexCharts from "react-apexcharts";
import ProductContext from "../inventory/context/ProductContext";

export default function SalesByCategory() {
    // 💡 Ambil transactionLog dan fetchTransactionLogAPI
    const {product, order, transactionLog, fetchTransactionLogAPI} = useContext(ProductContext);

    useEffect(() => {
        // Panggil fungsi untuk memuat data log transaksi
        fetchTransactionLogAPI();
    }, [fetchTransactionLogAPI]);

    // 💡 Gunakan useMemo untuk mengkalkulasi data kategori yang terjual
    const {chartSeries, chartLabels, legendItems, totalSalesAmount} = useMemo(() => {
        const categorySalesMap = {};
        const productCategoryMap = product.reduce((map, p) => {
            map[p.productName] = p.category;
            return map;
        }, {});

        // 1. Hitung Total Kuantitas Terjual per Kategori dari semua LOG TRANSAKSI
        transactionLog.forEach(log => {
            // 💡 GANTI order menjadi transactionLog
            log.products.forEach(p => {
                const productName = p.productName;
                const category = productCategoryMap[productName];
                const amount = Number(p.productAmount);

                if (category && !isNaN(amount) && amount > 0) {
                    if (categorySalesMap[category]) {
                        categorySalesMap[category] += amount;
                    } else {
                        categorySalesMap[category] = amount;
                    }
                }
            });
        });

        // ... (Logika konversi, sorting, dan legend items tetap sama) ...
        const sortedCategories = Object.entries(categorySalesMap)
            .map(([category, quantity]) => ({
                category,
                quantity
            }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        const totalSales = sortedCategories.reduce((sum, item) => sum + item.quantity, 0);

        const series = sortedCategories.map(item => item.quantity);
        const labels = sortedCategories.map(item => item.category);

        const customLegend = sortedCategories.map(item => {
            const percentage = totalSales > 0 ? ((item.quantity / totalSales) * 100).toFixed(1) : 0;
            return `${item.category} <b>${percentage}%</b>`;
        });

        return {
            chartSeries: series,
            chartLabels: labels,
            legendItems: customLegend,
            totalSalesAmount: totalSales
        };
    }, [product, transactionLog]); // 💡 GANTI dependency dari order ke transactionLog

    // Data options ApexCharts
    const donutOption = {
        labels: chartLabels,
        legend: {
            position: "right",
            fontSize: "14px",
            // 💡 Menggunakan customLegendItems yang sudah dikalkulasi
            customLegendItems: legendItems
        },
        title: {
            text: "Sales By Product Category (Top 5 QTY)",
            align: "center",
            style: {fontWeight: "bold"}
        },
        dataLabels: {
            // Menampilkan persentase pada irisan donat
            formatter: val => val.toFixed(1) + "%"
        },
        tooltip: {
            y: {
                formatter: val => `${val.toLocaleString("id-ID")} unit`
            }
        }
    };

    // Tampilkan pesan loading/kosong jika data belum siap
    if (chartSeries.length === 0) {
        return (
            <Box
                sx={{
                    margin: 3,
                    bgcolor: "white",
                    borderRadius: 2,
                    padding: 3,
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <Typography variant="h6" color="textSecondary">
                    {transactionLog.length === 0
                        ? "Belum ada data **Accepted Order** untuk dianalisis."
                        : "Memproses data kategori..."}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                margin: 3,
                bgcolor: "white",
                borderRadius: 2,
                padding: 3,
                height: "100%"
            }}
        >
            <ApexCharts options={donutOption} series={chartSeries} type="pie" width="100%" />
            <Typography variant="caption" display="block" align="center" sx={{mt: 1}}>
                Total Unit Terjual: {totalSalesAmount.toLocaleString("id-ID")} unit
            </Typography>
        </Box>
    );
}
