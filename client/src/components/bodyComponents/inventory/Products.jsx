import {createContext, useContext, useEffect, useState} from "react";
import {DataGrid} from "@mui/x-data-grid";
import ProductContext from "./context/ProductContext";
import {columns} from "./columns";
import {searchProducts, deleteProduct} from "../../../api/api";
import {Button, Box, Modal, Tooltip} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteForever";
import EditProduct from "./EditProduct";
import {getRoleFromToken} from "../../../utils/getRoleFromToken";
import PurchasingPriceModal from "./PurchasingPriceModal"; // 🟢 NEW

export const SelectionModelsContext = createContext();

function Products() {
    const {product, setProduct, fetchDataAPI} = useContext(ProductContext);
    const userRole = getRoleFromToken();

    const [selectionModels, setSelectionModels] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false); // 🟢 NEW

    useEffect(() => {
        fetchDataAPI();
    }, []);

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

    // 🟢 WAREHOUSE: Delete product
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

    // 🟢 WAREHOUSE: Edit product
    const handleEditOpen = () => {
        if (selectionModels.length === 1) {
            setIsEditModalOpen(true);
        }
    };
    const handleEditClose = () => {
        setIsEditModalOpen(false);
        setSelectionModels([]);
    };

    // 🟢 PURCHASING: Edit price (NEW)
    const handlePriceEditOpen = () => {
        if (selectionModels.length === 1) {
            setIsPriceModalOpen(true);
        }
    };
    const handlePriceEditClose = () => {
        setIsPriceModalOpen(false);
        setSelectionModels([]);
    };

    const productToEdit = selectionModels.length === 1 ? product.find(p => p.id === selectionModels[0]) : null;

    return (
        <>
            {/* 🔍 Input Search */}
            <div className="group">
                <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
                    <g>
                        <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                    </g>
                </svg>
                <input
                    placeholder="Search by ID or Name"
                    type="search"
                    className="input"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {/* 💡 ACTION BUTTONS - ROLE BASED */}
            <Box sx={{my: 2, display: "flex", gap: 1}}>
                {/* WAREHOUSE: Edit button */}
                {userRole === "warehouse" && selectionModels.length === 1 && productToEdit && (
                    <Tooltip title={`Edit produk: ${productToEdit?.productName || ""}`}>
                        <Button variant="contained" color="info" startIcon={<EditIcon />} onClick={handleEditOpen}>
                            Edit (1)
                        </Button>
                    </Tooltip>
                )}

                {/* WAREHOUSE: Delete button */}
                {userRole === "warehouse" && selectionModels.length > 0 && (
                    <Tooltip title={`Hapus ${selectionModels.length} produk terpilih`}>
                        <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
                            Hapus ({selectionModels.length})
                        </Button>
                    </Tooltip>
                )}

                {/* PURCHASING: Set Price button (NEW) */}
                {userRole === "purchasing" && selectionModels.length === 1 && productToEdit && (
                    <Tooltip title={`Set harga untuk: ${productToEdit?.productName || ""}`}>
                        <Button variant="contained" color="success" onClick={handlePriceEditOpen}>
                            Set Harga (1)
                        </Button>
                    </Tooltip>
                )}

                {/* MARKETING: No buttons (read-only) */}
                {userRole === "marketing" && (
                    <Tooltip title="Marketing: Read-only mode">
                        <Button variant="outlined" disabled>
                            Read-only Mode
                        </Button>
                    </Tooltip>
                )}
            </Box>

            {/* 📊 DATA GRID */}
            <SelectionModelsContext.Provider value={[selectionModels, setSelectionModels]}>
                <DataGrid
                    sx={{
                        borderLeft: 0,
                        borderRight: 0,
                        borderRadius: 0,
                        height: "35rem",
                        "& .MuiDataGrid-cell": {
                            whiteSpace: "normal",
                            lineHeight: "1.2",
                            display: "flex",
                            alignItems: "center"
                        }
                    }}
                    columns={columns(userRole)}
                    rows={displayedProducts}
                    getRowId={row => row.id}
                    initialState={{
                        pagination: {paginationModel: {page: 0, pageSize: 100}}
                    }}
                    pageSizeOptions={[5, 10, 20, 100]}
                    checkboxSelection={userRole !== "marketing"} // 🟢 Marketing: no checkbox
                    onRowSelectionModelChange={handleSelectionChange}
                    rowSelectionModel={userRole !== "marketing" ? selectionModels : []} // 🟢 Marketing: no selection
                />
            </SelectionModelsContext.Provider>

            {/* 🔧 MODAL EDIT - WAREHOUSE ONLY */}
            {userRole === "warehouse" && (
                <Modal open={isEditModalOpen} onClose={handleEditClose}>
                    <Box>
                        <EditProduct productToEdit={productToEdit} onClose={handleEditClose} />
                    </Box>
                </Modal>
            )}

            {/* 💰 MODAL SET PRICE - PURCHASING ONLY (NEW) */}
            {userRole === "purchasing" && (
                <Modal open={isPriceModalOpen} onClose={handlePriceEditClose}>
                    <Box>
                        <PurchasingPriceModal productToEdit={productToEdit} onClose={handlePriceEditClose} />
                    </Box>
                </Modal>
            )}
        </>
    );
}

export default Products;
