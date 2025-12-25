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
            const date = new Date(params.row.dateAdded);
            return (
                <Typography variant="body2">
                    {date.toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                    })}
                </Typography>
            );
        }
    },
    {
        field: "addedBy",
        headerName: "Ditambah Oleh",
        width: 130,
        renderCell: params => (
            <Typography variant="caption" sx={{textTransform: "uppercase"}}>
                {params.row.addedBy}
            </Typography>
        )
    }
];
