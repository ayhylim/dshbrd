// #Orders.jsx (REVISI FINAL)

import {createContext, useContext, useEffect, useState} from "react";
import {DataGrid} from "@mui/x-data-grid";
import ProductContext from "../inventory/context/ProductContext";
import {columns as orderColumns} from "./columns";
import DeleteProduct from "../inventory/DeleteProduct";
import {Button} from "@mui/material";

export const SelectionModelsContext = createContext();

function Orders({onOrderDetailClick, onEdit}) {
    const {order, setOrder, fetchDataOrderAPI, updateOrderStatusAPI, deleteMultipleOrdersAPI} =
        useContext(ProductContext);

    const [selectionModels, setSelectionModels] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchDataOrderAPI();
    }, [fetchDataOrderAPI]); // 💡 Tambahkan dependency fetchDataOrderAPI

    const filteredOrders = order.filter(
        item =>
            item.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.customer && item.customer.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const displayedOrders = filteredOrders.map((item, index) => ({
        ...item,
        rowNumber: index + 1
    }));

    const handleSelectionChange = newSelections => {
        setSelectionModels(newSelections);
    };

    // 💡 FUNGSI BARU: Menangani perubahan status (Accept/Decline)
    const handleStatusChange = async (orderId, newStatus) => {
        const confirmMsg =
            newStatus === "Accepted"
                ? "Apakah Anda yakin ingin MENG-ACCEPT order ini? Ini akan dicatat sebagai penjualan."
                : "Apakah Anda yakin ingin MEN-DECLINE order ini? Order akan dihapus dan stok dikembalikan.";

        if (!window.confirm(confirmMsg)) {
            return;
        }

        try {
            // Panggil fungsi API yang Anda siapkan di ProductContext
            // updateOrderStatusAPI akan:
            // 1. Decline: Hapus Order dari DB/State, Kembalikan Stok.
            // 2. Accept: Update Status Order di DB/State ke "Accepted", Buat Log Transaksi.
            const updatedOrder = await updateOrderStatusAPI(orderId, newStatus);

            // 💡 PENTING: Jika status diubah, biarkan ProductContext (updateOrderStatusAPI)
            // yang mengelola state `order` dan `transactionLog`.
            // Jika Anda ingin mengupdate state lokal di Orders.jsx secara langsung,
            // itu hanya perlu dilakukan jika ProductContext tidak melakukannya.

            // Berdasarkan revisi ProductContext.jsx:
            // - Declined: Order sudah dihapus di ProductContext. Tidak perlu setOrder lagi di sini.
            // - Accepted: Order sudah di-update di ProductContext. Tidak perlu setOrder lagi di sini.

            // KODE LAMA: Ada redundansi dan potensi bug jika logic di Context berubah.
            /*
            if (newStatus === "Declined") {
                // Hapus order dari state setelah Decline 
                setOrder(prev => prev.filter(o => o.id !== orderId)); 
                setSelectionModels(prev => prev.filter(id => id !== orderId));
            } else if (newStatus === "Accepted") {
                // Perbarui status order di state menggunakan hasil dari API (updatedOrder)
                setOrder(prev => prev.map(o => (o.id === orderId ? updatedOrder : o)));
            }
            */

            // 💡 Cukup atasi perubahan selectionModel untuk Declined (karena order hilang)
            if (newStatus === "Declined") {
                setSelectionModels(prev => prev.filter(id => id !== orderId));
            }

            alert(`Order ID ${orderId} berhasil diproses sebagai ${newStatus}.`);
        } catch (err) {
            console.error(`Gagal ${newStatus} order:`, err);
            alert(`Terjadi error saat memproses order: ${err.message}`);
            // PENTING: Jika gagal, Anda mungkin perlu me-refetch data untuk sinkronisasi,
            // terutama jika API gagal di tengah proses (misal: gagal kembalikan stok).
            fetchDataOrderAPI();
        }
    };

    const handleEdit = () => {
        if (selectionModels.length !== 1) return;
        const orderIdToEdit = selectionModels[0];
        // Pastikan order yang diedit adalah PENDING (Opsional, tapi disarankan)
        const orderData = order.find(o => o.id === orderIdToEdit && o.status !== "Accepted");

        if (!orderData) {
            alert("Hanya order PENDING yang dapat diedit.");
            return;
        }

        if (orderData && onEdit) {
            onEdit(orderData);
        }
    };

    const handleDelete = async () => {
        if (selectionModels.length === 0) {
            alert("Pilih order dulu");
            return;
        }

        const ordersToDelete = order.filter(o => selectionModels.includes(o.id));
        const acceptedOrders = ordersToDelete.filter(o => o.status === "Accepted");

        if (acceptedOrders.length > 0) {
            alert(`Tidak bisa menghapus ${acceptedOrders.length} order yang sudah di-Accepted.`);
            return;
        }

        if (
            !window.confirm(
                `Apakah Anda yakin ingin menghapus ${selectionModels.length} order? Stok produk akan dikembalikan.`
            )
        ) {
            return;
        }

        try {
            const selectedIds = [...selectionModels]; // Ambil copy ID yang dipilih

            // 💡 REVISI KRITIS: Panggil fungsi multi-delete yang sudah mengumpulkan stok
            await deleteMultipleOrdersAPI(selectedIds);

            // Setelah fungsi di Context selesai, state sudah terupdate
            setSelectionModels([]);
            alert(`${selectedIds.length} Order berhasil dihapus dan stok dikembalikan`);
        } catch (err) {
            console.error("Gagal hapus order:", err);
            alert(`Terjadi error saat menghapus order: ${err.message}. Silakan cek Inventory!`);
            fetchDataOrderAPI();
        }
    };

    return (
        <>
            <h1>Orders</h1>
            {/* 🔍 Input Search */}
            <div className="group">
                <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
                    <g>
                        <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                    </g>
                </svg>
                <input
                    placeholder="Search by ID or Customer Name"
                    type="search"
                    className="input"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {/* 💡 Tombol Aksi */}
            <div style={{display: "flex", gap: "10px", marginBottom: "15px", marginTop: "15px"}}>
                {/* Tombol Edit: Hanya muncul jika 1 PENDING order dipilih */}
                {selectionModels.length === 1 &&
                    order.find(o => o.id === selectionModels[0] && o.status !== "Accepted") && (
                        <Button variant="contained" color="primary" onClick={handleEdit}>
                            Edit Order
                        </Button>
                    )}
                {/* Tombol Delete: Muncul jika > 0 dipilih */}
                {selectionModels.length > 0 && <DeleteProduct handleDelete={handleDelete} />}
            </div>

            {/* 📊 DataGrid */}
            <SelectionModelsContext.Provider value={[selectionModels, setSelectionModels]}>
                <DataGrid
                    sx={{borderLeft: 0, borderRight: 0, borderRadius: 0, height: "35rem"}}
                    // 💡 Pass handleStatusChange ke columns
                    columns={orderColumns(onOrderDetailClick, handleStatusChange)}
                    rows={displayedOrders}
                    getRowId={row => row.id}
                    initialState={{
                        pagination: {paginationModel: {page: 0, pageSize: 100}}
                    }}
                    pageSizeOptions={[5, 10, 20, 100]}
                    checkboxSelection
                    onRowSelectionModelChange={handleSelectionChange}
                    rowSelectionModel={selectionModels}
                />
            </SelectionModelsContext.Provider>
        </>
    );
}

export default Orders;
