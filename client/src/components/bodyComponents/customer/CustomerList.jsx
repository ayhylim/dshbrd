// #CustomerList.jsx (REVISI FINAL)
import {useContext, useMemo, useState} from "react"; // 💡 TAMBAH useState
import {Box} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import {columns} from "./columns";
import ProductContext from "../inventory/context/ProductContext";

// Fungsi untuk mengkalkulasi total order dan QTY per customer (TIDAK BERUBAH)
const calculateCustomerData = allOrders => {
    const customerMap = {};

    allOrders.forEach(order => {
        // HANYA MENGHITUNG ORDER YANG SUDAH DITERIMA/DI PROSES (ACCEPTED)
        // Jika Anda ingin semua order, hapus kondisi ini
        if (order.status !== "Accepted") return;

        const customerName = order.customer;
        const orderDate = new Date(order.dateCreated);

        if (!customerMap[customerName]) {
            customerMap[customerName] = {
                name: customerName,
                orderCount: 0,
                totalQuantity: 0,
                lastOrderTime: orderDate
            };
        }

        // 1. Hitung Total QTY Ordered
        const orderProducts = order.products || [];
        const transactionQuantity = orderProducts.reduce((sum, item) => {
            const amount = Number(item.productAmount);
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        customerMap[customerName].totalQuantity += transactionQuantity;

        // 2. Hitung Total Jumlah Item Produk yang Berbeda (Order Count)
        // Catatan: Ini menghitung jumlah order yang berbeda, bukan total produk
        customerMap[customerName].orderCount += 1; // 💡 Tambahkan 1 untuk setiap order yang ditemukan

        // 3. Update Last Order Time
        if (orderDate > customerMap[customerName].lastOrderTime) {
            customerMap[customerName].lastOrderTime = orderDate;
        }
    });

    // Konversi peta ke array untuk DataGrid
    return Object.keys(customerMap).map((key, index) => ({
        id: index + 1, // ID digunakan untuk DataGrid, harus unik
        name: customerMap[key].name,
        orderCount: customerMap[key].orderCount,
        totalQuantity: customerMap[key].totalQuantity,
        lastOrderTime: customerMap[key].lastOrderTime
    }));
};

export default function CustomerList() {
    const {order} = useContext(ProductContext);
    // 💡 1. DEFINISIKAN STATE UNTUK PENCARIAN
    const [searchQuery, setSearchQuery] = useState("");

    // Gunakan useMemo untuk menghitung data pelanggan yang sudah dikelompokkan
    const processedCustomers = useMemo(() => {
        // ASUMSI: order yang dihitung hanya yang statusnya "Accepted"
        // Jika Anda menggunakan `transactionLog` dari context, ini akan lebih efisien.
        // Jika tidak, pastikan Anda memfilter di sini.
        return calculateCustomerData(order);
    }, [order]);

    // 💡 2. FILTER DATA BERDASARKAN QUERY PENCARIAN
    const filteredCustomers = useMemo(() => {
        if (!searchQuery) {
            return processedCustomers;
        }
        const lowerCaseQuery = searchQuery.toLowerCase();

        // Filter berdasarkan ID (nomor urut) atau Nama Customer
        return processedCustomers.filter(
            customer =>
                customer.name.toLowerCase().includes(lowerCaseQuery) || customer.id.toString().includes(lowerCaseQuery)
        );
    }, [processedCustomers, searchQuery]);

    return (
        <>
            <Box
                sx={{
                    margin: 3,
                    bgcolor: "white",
                    borderRadius: 2,
                    padding: 3,
                    height: "100%"
                }}
            >
                <h1>Customers</h1>
                {/* 🔍 Input Search */}
                <div className="group">
                    <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
                        {" "}
                        <g>
                            {" "}
                            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>{" "}
                        </g>{" "}
                    </svg>
                    <input
                        placeholder="Search by ID or Customer Name" // 💡 Ganti placeholder agar lebih sesuai
                        type="search"
                        className="input"
                        // 💡 HUBUNGKAN DENGAN STATE
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <DataGrid
                    sx={{
                        borderLeft: 0,
                        borderRight: 0,
                        borderRadius: 0,
                        height: "35rem"
                    }}
                    // 💡 GUNAKAN DATA YANG SUDAH DIFILTER
                    rows={filteredCustomers}
                    columns={columns}
                    getRowId={row => row.id}
                    initialState={{
                        pagination: {
                            paginationModel: {page: 0, pageSize: 15} // Ubah pageSize ke 15 (opsional)
                        }
                    }}
                    pageSizeOptions={[15, 20, 30]}
                    rowSelection={false}
                />
            </Box>
        </>
    );
}
