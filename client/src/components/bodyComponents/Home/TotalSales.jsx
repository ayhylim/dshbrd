import React, {useContext, useMemo, useEffect} from "react";
import {Box, Typography} from "@mui/material";
import ApexCharts from "react-apexcharts";
import ProductContext from "../inventory/context/ProductContext"; // SESUAIKAN PATH!

// Konstanta untuk Hari yang digunakan (Senin - Sabtu)
const WORK_DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]; // 💡 DITAMBAH SABTU (6 Hari)

// Fungsi pembantu untuk mendapatkan hari dalam seminggu (Senin=0, Sabtu=5)
const getDayIndex = date => {
    // getDay() mengembalikan 0 (Min) hingga 6 (Sab)
    const day = date.getDay();

    // Kita petakan: Sen (1) -> 0, Sel (2) -> 1, ..., Jum (5) -> 4, Sab (6) -> 5
    if (day >= 1 && day <= 6) {
        // 💡 Batas atas diubah ke 6 (Sabtu)
        return day - 1;
    }
    return null; // Abaikan Minggu (0)
};

// Fungsi pembantu untuk mendapatkan tanggal awal minggu yang dimulai dari Senin
const getStartOfWeek = date => {
    const day = date.getDay();
    // Jika Minggu (0), kita hitung mundur 6 hari untuk Senin lalu
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(date.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
};

export default function TotalSales() {
    // 💡 Ambil transactionLog dan fetchTransactionLogAPI
    const {product, order, transactionLog, fetchDataAPI, fetchDataOrderAPI, fetchTransactionLogAPI} =
        useContext(ProductContext);

    useEffect(() => {
        fetchDataAPI();
        fetchDataOrderAPI(); // Masih butuh data order untuk tabel order
        fetchTransactionLogAPI(); // 💡 PANGGIL FUNGSI BARU
    }, [fetchDataAPI, fetchDataOrderAPI, fetchTransactionLogAPI]); // 💡 Tambahkan fetchTransactionLogAPI ke dependencies

    // 💡 Kalkulasi Data Penjualan (Current Week vs Previous Week: Senin-Sabtu)
    const {currentWeekSales, previousWeekSales, currentWeekTotal, previousWeekTotal} = useMemo(() => {
        // ... (Logika penentuan rentang waktu tetap sama) ...
        const productPriceMap = product.reduce((map, p) => {
            map[p.productName] = Number(p.price) || 0;
            return map;
        }, {});

        const today = new Date();
        const currentWeekStart = getStartOfWeek(new Date(today));
        const previousWeekStart = getStartOfWeek(new Date(currentWeekStart));
        previousWeekStart.setDate(previousWeekStart.getDate() - 7);
        const previousWeekEnd = new Date(currentWeekStart);

        const currentSales = Array(6).fill(0);
        const previousSales = Array(6).fill(0);
        let totalCurrent = 0;
        let totalPrevious = 0;

        // 💡 ITERASI DATA TRANSAKSI (transactionLog)
        transactionLog.forEach(log => {
            // Asumsi: Di transactionLog, dateCreated adalah field yang digunakan
            const orderDate = new Date(log.dateCreated);
            const dayIndex = getDayIndex(orderDate);

            if (dayIndex !== null) {
                // Hitung Total Penjualan Moneter untuk order ini
                const totalOrderAmount = log.products.reduce((sum, p) => {
                    const price = productPriceMap[p.productName] || 0;
                    const amount = Number(p.productAmount) || 0;
                    return sum + price * amount;
                }, 0);

                if (totalOrderAmount === 0) return;

                // Cek Minggu Saat Ini (Current Week)
                if (orderDate >= currentWeekStart) {
                    currentSales[dayIndex] += totalOrderAmount;
                    totalCurrent += totalOrderAmount;
                    // Cek Minggu Sebelumnya (Previous Week)
                } else if (orderDate >= previousWeekStart && orderDate < previousWeekEnd) {
                    previousSales[dayIndex] += totalOrderAmount;
                    totalPrevious += totalOrderAmount;
                }
            }
        });

        return {
            currentWeekSales: currentSales,
            previousWeekSales: previousSales,
            currentWeekTotal: totalCurrent,
            previousWeekTotal: totalPrevious
        };
    }, [product, transactionLog]);

    // Format mata uang Rupiah
    const formatCurrency = value => {
        const formatted = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
        return formatted.replace("Rp", "").trim();
    };

    // 💡 Data Series
    const series = [
        {
            type: "line",
            name: "Minggu Ini",
            data: currentWeekSales
        },
        {
            name: "Minggu Lalu",
            data: previousWeekSales
        }
    ];

    // 💡 Options
    const options = {
        title: {
            text: "Total Penjualan",
            align: "left",
            style: {fontSize: "16px", color: "#666"}
        },
        subtitle: {
            text: "Perbandingan Penjualan (Senin - Sabtu)", // 💡 Judul diubah
            align: "left",
            style: {fontSize: "14px", color: "#666"}
        },
        stroke: {curve: "smooth", width: 3},
        legend: {
            customLegendItems: [
                `Minggu Ini <b>Rp ${formatCurrency(currentWeekTotal)}</b>`,
                `Minggu Lalu <b>Rp ${formatCurrency(previousWeekTotal)}</b>`
            ],
            position: "top",
            horizontalAlign: "center",
            fontSize: "14px",
            fontFamily: "Helvetica, Arial",
            offsetY: -20
        },
        markers: {
            size: 4,
            strokeWidth: 2,
            hover: {size: 9}
        },
        theme: {mode: "light"},
        chart: {
            height: 328,
            type: "line",
            zoom: {enabled: true},
            dropShadow: {enabled: true, top: 3, left: 2, blur: 4, opacity: 0.2}
        },
        xaxis: {
            // 💡 Kategori X sekarang Senin sampai Sabtu
            categories: WORK_DAYS
        },
        yaxis: {
            title: {text: "Total Penjualan (Rp)"},
            labels: {
                formatter: val => `Rp ${formatCurrency(val)}`
            }
        },
        tooltip: {
            y: {
                formatter: val => `Rp ${formatCurrency(val)}`
            }
        }
    };

    // ... (Bagian return Box dan pengecekan data tetap sama)

    // Tampilkan pesan jika tidak ada data order
    if (transactionLog.length === 0) {
        return (
            // ... (Pesan: Belum ada data order Accepted) ...
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
                    Belum ada data **Accepted Order** untuk menghitung total penjualan.
                </Typography>
            </Box>
        );
    }

    // ... (Logika jika data ada tapi total nol dalam 2 minggu terakhir tetap sama) ...
    if (currentWeekTotal === 0 && previousWeekTotal === 0) {
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
                    Tidak ada penjualan **Accepted** yang tercatat pada hari kerja (Senin-Sabtu) selama dua minggu
                    terakhir.
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
            <ApexCharts options={options} series={series} height={300} type="line" width="100%" />
        </Box>
    );
}
