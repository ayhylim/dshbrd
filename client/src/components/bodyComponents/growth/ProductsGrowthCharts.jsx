import {useEffect, useState, useContext, useMemo} from "react";
import ApexCharts from "react-apexcharts";
import {Box, Typography} from "@mui/material";
import ProductContext from "../inventory/context/ProductContext"; // Path sudah benar

// --- CONSTANTS AND HELPER FUNCTIONS (Tetap Sama) ---
const WORK_DAYS = ["Mon", "Tue", "Web", "Thu", "Fri", "Sat"];
const WORK_DAYS_INDONESIAN = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

/**
 * Mendapatkan index hari kerja (Senin=0, Sabtu=5). Abaikan Minggu.
 */
const getDayIndex = date => {
    // getDay() mengembalikan 0 (Min) hingga 6 (Sab)
    const day = date.getDay();

    // Kita petakan: Sen (1) -> 0, Sel (2) -> 1, ..., Jum (5) -> 4, Sab (6) -> 5
    if (day >= 1 && day <= 6) {
        // Batas atas 6 (Sabtu)
        return day - 1;
    }
    return null; // Abaikan Minggu (0)
};

/**
 * Mendapatkan tanggal awal minggu (Senin).
 */
const getStartOfWeek = date => {
    const day = date.getDay();
    // Jika Minggu (0), kita hitung mundur 6 hari untuk Senin lalu
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(date.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
};

/**
 * Menghitung Total QTY Produk Terjual per Hari (Senin-Sabtu) dari Log Transaksi (ACCEPTED).
 * @param {Array} transactionLog - Data log transaksi (Order Accepted)
 */
const calculateWeeklyProductSales = (transactionLog, currentWeekStart, previousWeekStart, previousWeekEnd) => {
    // Array 6 hari: [Sen, Sel, Rab, Kam, Jum, Sab]
    const currentSales = Array(6).fill(0);
    const previousSales = Array(6).fill(0);

    // 💡 Menggunakan transactionLog sebagai input
    transactionLog.forEach(log => {
        // Asumsi log.acceptedAt ada di ProductContext.jsx yang direvisi
        const orderDate = new Date(log.acceptedAt || log.dateCreated);
        const dayIndex = getDayIndex(orderDate); // null jika Minggu

        if (dayIndex !== null) {
            let totalAmountInOrder = 0;
            if (Array.isArray(log.products)) {
                // Total Kuantitas (QTY) produk yang terjual dalam log ini
                totalAmountInOrder = log.products.reduce((sum, item) => sum + Number(item.productAmount || 0), 0);
            }

            if (totalAmountInOrder === 0) return;

            // Cek Minggu Saat Ini (Current Week)
            if (orderDate >= currentWeekStart) {
                currentSales[dayIndex] += totalAmountInOrder;

                // Cek Minggu Sebelumnya (Previous Week)
            } else if (orderDate >= previousWeekStart && orderDate < previousWeekEnd) {
                previousSales[dayIndex] += totalAmountInOrder;
            }
        }
    });

    return {currentSales, previousSales};
};

// --- KOMPONEN UTAMA ---
export default function ProductsGrowthCharts() {
    // 💡 PERUBAHAN KRITIS: Ambil transactionLog dan fetchTransactionLogAPI
    const {transactionLog, fetchTransactionLogAPI} = useContext(ProductContext);

    useEffect(() => {
        // Panggil fetchTransactionLogAPI jika log transaksi kosong
        if (transactionLog.length === 0) fetchTransactionLogAPI();
        // 💡 Catatan: Jika Anda tidak punya dependency fetchDataOrderAPI di ProductsGrowthCharts.jsx,
        // sekarang kita ganti dengan fetchTransactionLogAPI.
    }, [transactionLog.length, fetchTransactionLogAPI]);

    // 💡 FUNGSI useMemo untuk menghitung data penjualan per hari
    const {currentWeekData, previousWeekData} = useMemo(() => {
        // 💡 Cek transactionLog.length
        if (transactionLog.length === 0) {
            return {currentWeekData: Array(6).fill(0), previousWeekData: Array(6).fill(0)};
        }

        // 1. Tentukan Rentang Tanggal (Logika tetap sama)
        const today = new Date();
        const currentWeekStart = getStartOfWeek(new Date(today));
        const previousWeekStart = getStartOfWeek(new Date(currentWeekStart));
        previousWeekStart.setDate(previousWeekStart.getDate() - 7);
        const previousWeekEnd = new Date(currentWeekStart);

        // 2. Hitung Data Penjualan (Menggunakan transactionLog)
        const {currentSales, previousSales} = calculateWeeklyProductSales(
            transactionLog, // 💡 GANTI order menjadi transactionLog
            currentWeekStart,
            previousWeekStart,
            previousWeekEnd
        );

        return {
            currentWeekData: currentSales,
            previousWeekData: previousSales
        };
    }, [transactionLog]); // 💡 Dependency diubah menjadi transactionLog

    // 💡 Update series dengan data dinamis
    const series = [
        {
            name: "Current Week",
            data: currentWeekData
        },
        {
            name: "Previous Week",
            data: previousWeekData
        }
    ];

    // ... (Logika options3, currentTotal, previousTotal tetap sama) ...
    const currentTotal = currentWeekData.reduce((a, b) => a + b, 0);
    const previousTotal = previousWeekData.reduce((a, b) => a + b, 0);

    const options3 = {
        colors: ["#BF181D", "#FFBF00"],

        chart: {
            id: "product-growth-chart",
            type: "line",
            toolbar: {show: false}
        },
        dataLabels: {
            enabled: false
        },
        // 💡 Perbarui Legenda untuk menampilkan Total QTY
        legend: {
            customLegendItems: [`Minggu Ini (${currentTotal} QTY)`, `Minggu Lalu (${previousTotal} QTY)`],
            position: "top",
            horizontalAlign: "center",
            offsetY: 0
        },
        title: {
            text: "Product Sales Growth (QTY)"
        },

        stroke: {
            width: 3,
            curve: "smooth"
        },
        markers: {
            size: 5,
            strokeWidth: 0,
            hover: {
                size: 7
            }
        },
        fill: {
            opacity: 1
        },
        xaxis: {
            // 💡 Menggunakan 6 hari kerja
            categories: WORK_DAYS
        },
        tooltip: {
            fixed: {
                enabled: true,
                position: "topLeft",
                offsetY: 30,
                offsetX: 60
            }
        }
    };

    // 💡 Cek loading menggunakan transactionLog
    const isDataLoading = transactionLog.length === 0;

    return (
        <Box
            sx={{
                margin: 4,
                bgcolor: "white",
                borderRadius: 2,
                padding: 3,
                height: "95%"
            }}
        >
            <Typography variant="h6" sx={{mb: 2, fontWeight: "bold"}}>
                Product Sales Growth (Senin - Sabtu)
            </Typography>
            {isDataLoading ? (
                <Typography sx={{p: 5, textAlign: "center"}}>Memuat data order...</Typography>
            ) : (
                <ApexCharts options={options3} series={series} type="line" width="100%" height="320" />
            )}
        </Box>
    );
}
