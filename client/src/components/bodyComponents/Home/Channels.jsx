// #Channel.jsx (LENGKAP)

import {useContext, useMemo, useEffect} from "react";
// 💡 ASUMSI: Import library UI dan Chart (sesuaikan dengan project Anda)
import {Box, Typography} from "@mui/material";
import ProductContext from "../inventory/context/ProductContext";
import ApexCharts from "react-apexcharts";

// 💡 ASUMSI: Fungsi utility helper yang digunakan untuk membandingkan tanggal
const getDaysAgo = days => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    // Atur jam, menit, detik, milidetik menjadi 0 untuk perbandingan tanggal yang akurat
    d.setHours(0, 0, 0, 0);
    return d;
};

// 💡 ASUMSI: Fungsi utility helper untuk mendapatkan label hari
const getDayLabel = dayIndex => {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    return days[dayIndex];
};

export default function Channels() {
    const {product, transactionLog, fetchDataAPI, fetchDataOrderAPI, fetchTransactionLogAPI} =
        useContext(ProductContext);

    // 1. Fetch Data Awal
    useEffect(() => {
        fetchDataAPI();
        fetchDataOrderAPI();
        fetchTransactionLogAPI();
    }, [fetchDataAPI, fetchDataOrderAPI, fetchTransactionLogAPI]);

    // 2. Kalkulasi Data Penjualan (Hanya 7 Hari Terakhir)
    const {productSalesByDay, topFiveProductNames} = useMemo(() => {
        const productMap = product.reduce((map, p) => {
            map[p.productName] = p;
            return map;
        }, {});

        const totalSalesMap = {};
        const salesByDayMap = {};
        const sevenDaysAgo = getDaysAgo(6);

        // ITERASI LOG TRANSAKSI
        transactionLog.forEach(log => {
            // ASUMSI: log.dateCreated adalah timestamp ISO string
            const orderDate = new Date(log.acceptedAt || log.dateCreated); // Gunakan acceptedAt jika ada

            // Filter hanya log dalam 7 hari terakhir
            if (orderDate < sevenDaysAgo) return;

            // Mendapatkan hari dalam seminggu (0=Minggu, 6=Sabtu)
            const dayOfWeek = orderDate.getDay();
            const productNames = product.map(p => p.productName);
            const isProductValid = name => productNames.includes(name);

            if (log.products) {
                log.products.forEach(p => {
                    const name = p.productName;
                    const amount = Number(p.productAmount);

                    if (name && amount > 0 && isProductValid(name)) {
                        // A. Hitung Total QTY untuk Top 5 Ranking
                        totalSalesMap[name] = (totalSalesMap[name] || 0) + amount;

                        // B. Hitung QTY per Hari
                        if (!salesByDayMap[name]) {
                            // Inisialisasi array 7 hari
                            salesByDayMap[name] = Array(7).fill(0);
                        }
                        salesByDayMap[name][dayOfWeek] += amount;
                    }
                });
            }
        });

        // Tentukan Top 5 Produk berdasarkan total QTY terjual
        const sortedProducts = Object.entries(totalSalesMap)
            .sort(([, qtyA], [, qtyB]) => qtyB - qtyA)
            .slice(0, 5);

        const topFiveProductNames = sortedProducts.map(([name]) => name);

        return {productSalesByDay: salesByDayMap, topFiveProductNames};
    }, [product, transactionLog]);

    // 3. Format Data untuk ApexCharts
    const channelData = useMemo(() => {
        if (topFiveProductNames.length === 0) return [];

        // Buat series data
        const series = topFiveProductNames.map(name => {
            const dataPerDay = productSalesByDay[name] || Array(7).fill(0);

            // Re-order data harian agar dimulai dari Minggu (0) hingga Sabtu (6)
            // Namun, data sudah dihitung berdasarkan dayOfWeek (0-6), jadi cukup gunakan
            return {
                name: name,
                data: dataPerDay
            };
        });

        return series;
    }, [topFiveProductNames, productSalesByDay]);

    // 4. Konfigurasi ApexCharts
    const options3 = useMemo(
        () => ({
            chart: {
                id: "daily-sales-chart",
                toolbar: {
                    show: false
                }
            },
            title: {
                text: "Top 5 Product Sales QTY (7 Days)",
                align: "left",
                style: {
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#263238"
                }
            },
            xaxis: {
                categories: Array.from({length: 7}, (_, i) => getDayLabel(i)) // Label: Min, Sen, Sel, ...
            },
            yaxis: {
                title: {
                    text: "Quantity Sold (QTY)"
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "55%",
                    endingShape: "rounded"
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ["transparent"]
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + " QTY";
                    }
                }
            },
            // Tambahkan warna dinamis jika Anda memilikinya
            colors: ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0"]
        }),
        []
    );

    // Tampilkan pesan jika tidak ada data
    if (topFiveProductNames.length === 0) {
        return (
            <Box
                sx={{
                    margin: 3,
                    bgcolor: "white",
                    borderRadius: 2,
                    padding: 3,
                    height: "95%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <Typography variant="h6" color="textSecondary">
                    Belum ada **Accepted Order** dalam 7 hari terakhir.
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
                height: "95%"
            }}
        >
            {/* ASUMSI: ApexCharts dipanggil di sini */}
            <ApexCharts options={options3} series={channelData} type="bar" width="100%" height="320" />
        </Box>
    );
}
