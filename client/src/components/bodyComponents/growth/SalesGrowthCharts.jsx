// #SalesGrowthCharts.jsx (Optimized Design: Soft Color Palette)

import {Box, Typography} from "@mui/material";
import React, {useContext, useMemo, useEffect, useState} from "react";
import ApexCharts from "react-apexcharts";
import ProductContext from "../inventory/context/ProductContext";

// Label bulan
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Agu", "Sep", "Oct", "Nov", "Dec"];

// Fungsi format angka mata uang (untuk Tooltip & Y-Axis)
const formatCurrency = val => {
    if (val === undefined || val === null) return "Rp0";
    const num = Number(val);
    if (isNaN(num)) return "Rp0";

    if (num >= 1000000000) return "Rp" + (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1000000) return "Rp" + (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return "Rp" + (num / 1000).toFixed(0) + "K";
    return "Rp" + num.toFixed(0);
};

export default function SalesGrowthCharts() {
    // Ambil productList dan transactionLog
    const {transactionLog, product: productList, fetchTransactionLogAPI} = useContext(ProductContext);
    const [chartSeries, setChartSeries] = useState([]);

    useEffect(() => {
        fetchTransactionLogAPI();
    }, [fetchTransactionLogAPI]);

    // Kalkulasi Data Revenue per Bulan (LOGIKA TETAP SAMA)
    const monthlyRevenue = useMemo(() => {
        const revenueMap = {};
        const currentYear = new Date().getFullYear();

        transactionLog.forEach(log => {
            const acceptedAt = log.acceptedAt || log.dateCreated;

            if (!acceptedAt) return;
            const date = new Date(acceptedAt);
            if (isNaN(date.getTime())) return;

            // Hanya proses transaksi di TAHUN INI
            if (date.getFullYear() !== currentYear) return;

            const monthIndex = date.getMonth(); // 0-11
            const monthKey = `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}`;

            let orderRevenue = 0;

            if (log.products) {
                log.products.forEach(p => {
                    let price;

                    // 1. Coba ambil harga dari Log Transaksi (jika ada)
                    if (p.productPrice !== undefined && !isNaN(Number(p.productPrice))) {
                        price = Number(p.productPrice);
                    } else {
                        // 2. Jika tidak ada/Invalid di log, cari harga saat ini di productList
                        const currentProduct = productList.find(item => item.productName === p.productName);
                        price = currentProduct ? Number(currentProduct.price) : 0;
                    }

                    const amount = Number(p.productAmount);

                    // Cek validitas akhir sebelum kalkulasi
                    if (isNaN(price) || isNaN(amount) || price < 0 || amount < 0) {
                        console.warn(
                            `Invalid data found: Price=${price}, Amount=${amount} for product: ${p.productName}`
                        );
                        return;
                    }

                    const subtotal = price * amount;
                    orderRevenue += subtotal;
                });
            }

            revenueMap[monthKey] = (revenueMap[monthKey] || 0) + orderRevenue;
        });

        const thisYearData = [];

        // Isi array 12 bulan
        for (let month = 0; month < 12; month++) {
            const monthKey = `${currentYear}-${String(month + 1).padStart(2, "0")}`;
            thisYearData.push(revenueMap[monthKey] || 0);
        }

        return thisYearData;
    }, [transactionLog, productList]);

    useEffect(() => {
        setChartSeries([
            {
                name: "Total Revenue",
                data: monthlyRevenue
            }
        ]);
    }, [monthlyRevenue]);

    // Konfigurasi ApexCharts (Warna Disesuaikan)
    const options = useMemo(
        () => ({
            chart: {
                id: "sales-growth-chart",
                type: "area",
                toolbar: {show: false},
                zoom: {enabled: false}
            },
            colors: ["#00B894"], // 💡 WARNA BARU: Teal/Hijau Mint yang lembut
            fill: {
                type: "gradient",
                gradient: {
                    shadeIntensity: 1,
                    // Opacity dibuat lebih rendah agar area lebih soft
                    opacityFrom: 0.5,
                    opacityTo: 0.7,
                    stops: [0, 100]
                }
            },
            dataLabels: {enabled: false},
            stroke: {
                curve: "smooth",
                width: 3,
                colors: ["#00B894"] // Warna garis sama dengan fill
            },
            legend: {
                position: "top",
                horizontalAlign: "center",
                offsetY: 0
            },
            title: {
                text: `Sales Revenue Growth (${new Date().getFullYear()})`,
                align: "left",
                style: {
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#263238"
                }
            },
            xaxis: {
                categories: MONTH_LABELS,
                tooltip: {enabled: false}
            },
            yaxis: {
                title: {
                    text: "Total Revenue (Rp)"
                },
                labels: {
                    formatter: val => formatCurrency(val)
                }
            },
            tooltip: {
                y: {
                    formatter: val => "Rp " + Number(val).toLocaleString("id-ID")
                }
            }
        }),
        []
    );

    // Tampilkan pesan jika tidak ada data
    if (transactionLog.length === 0) {
        return (
            <Box
                sx={{
                    marginX: 4,
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
                    Belum ada **Accepted Order** di tahun ini.
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                marginX: 4,
                bgcolor: "white",
                borderRadius: 2,
                padding: 3,
                height: "100%"
            }}
        >
            <ApexCharts options={options} series={chartSeries} height={300} type="area" width="100%" />
        </Box>
    );
}
