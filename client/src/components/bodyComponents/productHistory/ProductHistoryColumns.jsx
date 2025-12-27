import {Typography} from "@mui/material";

export const productHistoryColumns = [
    {
        field: "rowNumber",
        headerName: "No",
        width: 70,
        sortable: false,
        filterable: false
    },
    {
        field: "productId",
        headerName: "Product ID",
        width: 150,
        renderCell: params => (
            <Typography variant="body2" sx={{fontWeight: "bold"}}>
                {params.row.productId}
            </Typography>
        )
    },
    {
        field: "productName",
        headerName: "Nama Produk",
        width: 200,
        flex: 1
    },
    {
        field: "category",
        headerName: "Kategori",
        width: 150
    },
    {
        field: "stock",
        headerName: "Stok Awal",
        width: 120,
        valueGetter: params => `${params.row.stock} ${params.row.quantityType?.toUpperCase() || "PCS"}`
    },
    {
        field: "dateAdded",
        headerName: "Tanggal Penambahan",
        width: 200,
        renderCell: params => {
            try {
                const date = new Date(params.row.dateAdded);
                if (isNaN(date.getTime())) {
                    return "Invalid Date";
                }
                // Format: DD/MM/YY
                return date.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit"
                });
            } catch (error) {
                return "Invalid Date";
            }
        }
    }
];
