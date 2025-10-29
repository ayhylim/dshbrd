// #Products.jsx (Revisi Logika Tombol)

import {createContext, useContext, useEffect, useState} from "react";
import {DataGrid} from "@mui/x-data-grid";
import ProductContext from "./context/ProductContext";
import {columns} from "./columns";
// import DeleteProduct from "./DeleteProduct"; // ❌ Hapus ini, kita buat tombol di sini
import {searchProducts, deleteProduct} from "../../../api/api";
// 💡 Import komponen baru dan Mui
import {Button, Box, Modal, Tooltip} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteForever";
import EditProduct from "./EditProduct"; // 💡 KOMPONEN BARU

export const SelectionModelsContext = createContext();

function Products() {
    const {product, setProduct, fetchDataAPI} = useContext(ProductContext);

    const [selectionModels, setSelectionModels] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // 💡 STATE BARU: Untuk mengontrol modal Edit
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchDataAPI();
    }, []);

    const searchProduct = async keyword => {
        const response = await searchProducts(keyword);
        return response;
    };

    const displayedProducts = searchQuery
        ? product.filter(
              item =>
                  item.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (item.productName && item.productName.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : product;

    const handleSelectionChange = newSelections => {
        setSelectionModels(newSelections);
    };

    const handleDelete = async () => {
        if (selectionModels.length === 0) {
            alert("Pilih produk dulu");
            return;
        }
        if (!window.confirm(`Yakin ingin menghapus ${selectionModels.length} produk yang dipilih?`)) {
            return;
        }
        try {
            await Promise.all(selectionModels.map(id => deleteProduct(id)));
            setProduct(prev => prev.filter(p => !selectionModels.includes(p.id)));
            setSelectionModels([]);
        } catch (err) {
            console.error("Gagal hapus produk:", err);
            alert("Terjadi error saat menghapus produk");
        }
    };

    // 💡 FUNGSI UNTUK MODAL EDIT
    const handleEditOpen = () => {
        if (selectionModels.length === 1) {
            setIsEditModalOpen(true);
        }
    };
    const handleEditClose = () => {
        setIsEditModalOpen(false);
        // Opsi: reset selectionModels setelah edit ditutup
        setSelectionModels([]);
    };

    // Ambil data produk yang sedang diedit (hanya jika 1 terpilih)
    const productToEdit = selectionModels.length === 1 ? product.find(p => p.id === selectionModels[0]) : null;

    return (
        <>
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
                    placeholder="Search by ID or Name"
                    type="search"
                    className="input"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {/* 💡 TOMBOL EDIT DAN DELETE */}
            <Box sx={{my: 2, display: "flex", gap: 1}}>
                {/* Tombol Edit: Hanya muncul jika selectionModels.length === 1 */}
                {selectionModels.length === 1 && (
                    <Tooltip title={`Edit produk: ${productToEdit?.productName || ""}`}>
                        <Button variant="contained" color="info" startIcon={<EditIcon />} onClick={handleEditOpen}>
                            Edit (1)
                        </Button>
                    </Tooltip>
                )}

                {/* Tombol Delete: Muncul jika selectionModels.length > 0 */}
                {selectionModels.length > 0 && (
                    <Tooltip title={`Hapus ${selectionModels.length} produk terpilih`}>
                        <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
                            Hapus ({selectionModels.length})
                        </Button>
                    </Tooltip>
                )}
            </Box>

            {/* 📊 Tampilkan data yang sudah difilter */}
            <SelectionModelsContext.Provider value={[selectionModels, setSelectionModels]}>
                <DataGrid
                    sx={{borderLeft: 0, borderRight: 0, borderRadius: 0, height: "35rem"}}
                    columns={columns}
                    rows={displayedProducts}
                    getRowId={row => row.id}
                    initialState={{
                        pagination: {paginationModel: {page: 0, pageSize: 100}}
                    }}
                    pageSizeOptions={[5, 10, 20, 100]}
                    checkboxSelection
                    onRowSelectionModelChange={handleSelectionChange}
                    rowSelectionModel={selectionModels}
                />
                {/* Hapus div lama untuk DeleteProduct */}
                {/* <div className="">{selectionModels.length > 0 && <DeleteProduct handleDelete={handleDelete} />}</div> */}
            </SelectionModelsContext.Provider>

            {/* 💡 MODAL EDIT */}
            <Modal open={isEditModalOpen} onClose={handleEditClose}>
                <Box>
                    {/* Kirim data produk yang mau diedit dan fungsi penutup modal */}
                    <EditProduct productToEdit={productToEdit} onClose={handleEditClose} />
                </Box>
            </Modal>
        </>
    );
}

export default Products;
