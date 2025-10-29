// #CustomerGrowthCharts.jsx (LENGKAP dengan Logika Data Nyata)

import React, {useEffect, useState, useContext, useMemo} from "react";
import ApexCharts from "react-apexcharts";
import {Box} from "@mui/material";
// Import ProductContext untuk mengakses transactionLog
import ProductContext from "../inventory/context/ProductContext";

// Fungsi utility helper yang digunakan untuk membandingkan tanggal (sama seperti di Channel.jsx)
const getDaysAgo = days => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    // Atur jam, menit, detik, milidetik menjadi 0 untuk perbandingan tanggal yang akurat
    d.setHours(0, 0, 0, 0);
    return d;
};

// Fungsi utility helper untuk mendapatkan label hari (sama seperti di Channel.jsx)
const getDayLabel = dayIndex => {
    // Label: Min (0), Sen (1), ..., Sab (6)
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    return days[dayIndex];
};

export default function CustomersGrowthCharts() {
    // Ambil transactionLog dan fetch API dari Context
    const {transactionLog, fetchTransactionLogAPI} = useContext(ProductContext);

    // Gunakan state untuk data chart
    const [chartSeries, setChartSeries] = useState([]);

    // 1. Fetch data saat komponen dimuat
    useEffect(() => {
        fetchTransactionLogAPI();
    }, [fetchTransactionLogAPI]);

    // 2. Kalkulasi Data Customer Unik per Hari (7 Hari Terakhir)
    const {currentWeekData, previousWeekData, chartCategories} = useMemo(() => {
        // Mendapatkan range tanggal untuk 7 hari terakhir (Minggu Ini)
        const sevenDaysAgo = getDaysAgo(6);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Mendapatkan range tanggal untuk 7 hari sebelumnya (Minggu Lalu)
        const fourteenDaysAgo = getDaysAgo(13);
        const eightDaysAgo = getDaysAgo(7);

        // Structure: { DayIndex: Set<CustomerName> }
        const currentWeekCustomers = Array(7)
            .fill(0)
            .map(() => new Set());
        const previousWeekCustomers = Array(7)
            .fill(0)
            .map(() => new Set());

        const currentDayIndex = today.getDay(); // Hari ini (0-6)

        transactionLog.forEach(log => {
            const acceptedDate = new Date(log.acceptedAt || log.dateCreated);
            acceptedDate.setHours(0, 0, 0, 0);
            const customerName = log.customer;

            if (!customerName) return; // Skip jika tidak ada nama customer

            // Hitung Customer Minggu Ini (7 hari terakhir)
            if (acceptedDate >= sevenDaysAgo && acceptedDate <= today) {
                const dayIndex = acceptedDate.getDay();
                // Simpan nama customer di index hari yang sesuai
                currentWeekCustomers[dayIndex].add(customerName);
            }

            // Hitung Customer Minggu Lalu (7 hari sebelumnya)
            if (acceptedDate >= fourteenDaysAgo && acceptedDate < eightDaysAgo) {
                const dayIndex = acceptedDate.getDay();
                previousWeekCustomers[dayIndex].add(customerName);
            }
        });

        // Konversi Set menjadi Array Data (hitung size dari Set)
        let currentData = currentWeekCustomers.map(set => set.size);
        let previousData = previousWeekCustomers.map(set => set.size);

        // Menggeser data agar dimulai dari hari Minggu (index 0)
        // Dan Hanya menampilkan data hingga hari ini
        const categories = Array.from({length: 7}, (_, i) => getDayLabel(i));

        // Ambil data hanya sampai hari ini (misal: jika hari ini Rabu (index 3), ambil index 0, 1, 2, 3)
        // Jika Anda ingin melihat 7 hari penuh, Anda bisa melewati langkah ini.
        // Kita akan menampilkan data 7 hari penuh.

        return {
            currentWeekData: currentData,
            previousWeekData: previousData,
            chartCategories: categories
        };
    }, [transactionLog]);

    // 3. Update State Chart Series
    useEffect(() => {
        if (currentWeekData.length > 0) {
            setChartSeries([
                {
                    name: "Current Week",
                    data: currentWeekData
                },
                {
                    name: "Previous Week",
                    data: previousWeekData
                }
            ]);
        }
    }, [currentWeekData, previousWeekData]);

    // 4. Konfigurasi ApexCharts (gunakan useMemo agar tidak di-render ulang)
    const options3 = useMemo(
        () => ({
            colors: ["#0070E0", "#E32227"], // Warna diubah agar biru (Current) ada di atas
            chart: {
                id: "customer-growth-chart",
                type: "line", // Type bar di config, tapi line di JSX
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                position: "top",
                horizontalAlign: "center",
                offsetY: 0
            },
            title: {
                text: "Customer Growth (Unique Accepted Orders / Day)",
                align: "left",
                style: {
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#263238"
                }
            },
            stroke: {
                curve: "smooth",
                width: 3
            },
            markers: {
                size: 4,
                strokeWidth: 0,
                hover: {
                    size: 7
                }
            },
            fill: {
                opacity: 1
            },
            xaxis: {
                categories: chartCategories // Gunakan kategori hari yang sudah dihitung
            },
            yaxis: {
                title: {
                    text: "Total Unique Customers"
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + " Customers";
                    }
                }
            },
            grid: {
                show: true,
                xaxis: {
                    lines: {
                        show: true
                    }
                },
                yaxis: {
                    lines: {
                        show: true
                    }
                }
            }
        }),
        [chartCategories] // Dependensi kategori hari
    );

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
            <ApexCharts
                options={options3}
                series={chartSeries.length > 0 ? chartSeries : []}
                type="line" // Pastikan type di JSX adalah "line" sesuai dengan desain Anda
                width="100%"
                height="320"
            />
        </Box>
    );
}
