import React, {useContext, useEffect, useState} from "react";
import {Box, Typography, Button} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import ProductContext from "../inventory/context/ProductContext";
import {productHistoryColumns} from "./productHistoryColumns";

export default function ProductHistory() {
    const {productHistory, fetchProductHistoryAPI, onDeleteProductHistory} = useContext(ProductContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectionModels, setSelectionModels] = useState([]);

    useEffect(() => {
        fetchProductHistoryAPI();
    }, [fetchProductHistoryAPI]);

    const filteredHistory = productHistory.filter(
        item =>
            item.productId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.productName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayedHistory = filteredHistory.map((item, index) => ({
        ...item,
        rowNumber: index + 1
    }));

    const handleDelete = async () => {
        if (selectionModels.length === 0) {
            alert("Pilih history yang akan dihapus");
            return;
        }

        if (!window.confirm(`Hapus ${selectionModels.length} history?`)) {
            return;
        }

        try {
            await Promise.all(selectionModels.map(id => onDeleteProductHistory(id)));
            setSelectionModels([]);
            alert("✅ History berhasil dihapus");
        } catch (err) {
            console.error("Error:", err);
            alert("❌ Gagal menghapus history");
        }
    };

    return (
        <Box sx={{m: 0, p: 3, width: "100%"}}>
            <Box
                sx={{
                    margin: 3,
                    bgcolor: "white",
                    borderRadius: 2,
                    padding: 3,
                    height: "100%"
                }}
            >
                <Typography variant="h5" sx={{mb: 3, fontWeight: "bold"}}>
                    📋 Riwayat Penambahan Produk
                </Typography>

                {/* 🔍 Search */}
                <div className="group">
                    <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
                        <g>
                            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                        </g>
                    </svg>
                    <input
                        placeholder="Cari berdasarkan ID atau Nama Produk"
                        type="search"
                        className="input"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* 🗑️ Delete Button */}
                {selectionModels.length > 0 && (
                    <Button variant="contained" color="error" onClick={handleDelete} sx={{my: 2}}>
                        Hapus ({selectionModels.length})
                    </Button>
                )}

                {/* 📊 Data Grid */}
                <DataGrid
                    sx={{
                        borderLeft: 0,
                        borderRight: 0,
                        borderRadius: 0,
                        height: "35rem"
                    }}
                    rows={displayedHistory}
                    columns={productHistoryColumns}
                    getRowId={row => row.id}
                    initialState={{
                        pagination: {paginationModel: {page: 0, pageSize: 15}}
                    }}
                    pageSizeOptions={[10, 15, 20]}
                    checkboxSelection
                    onRowSelectionModelChange={setSelectionModels}
                    rowSelectionModel={selectionModels}
                />
            </Box>
        </Box>
    );
}
