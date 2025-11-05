import {Typography} from "@mui/material";
import {getRoleFromToken} from "../../../utils/getRoleFromToken";

export const columns = (role = getRoleFromToken()) => {
    const baseColumns = [
        {
            field: "id",
            headerName: "ID",
            width: 90,
            description: "id of the product"
        },
        {
            field: "productName",
            headerName: "Product Name",
            width: 200,
            description: "product name",
            resizable: true,
            flex: 1,
            renderCell: cellData => (
                <div
                    style={{
                        whiteSpace: "normal", 
                        lineHeight: "1.2",
                        padding: "8px 0"
                    }}
                >
                    <Typography variant="subtitle2" sx={{mx: 3}}>
                        {cellData.row.productName}
                    </Typography>
                </div>
            )
        },
        {
            field: "category",
            headerName: "Category",
            width: 150,
            description: "category of the product"
        },
        {
            field: "stock",
            headerName: "Stock",
            width: 100,
            description: "stock quantity",
            valueGetter: params => {
                const stock = params.row.stock;
                const unit = params.row.quantityType ? params.row.quantityType.toUpperCase() : "PCS";
                return `${stock} ${unit}`;
            }
        }
    ];

    // WAREHOUSE: Lihat ONLY id, productName, category, stock, quantityType
    if (role === "warehouse") {
        return baseColumns;
    }

    // PURCHASING: Lihat semua termasuk price (hargaJual) + hargaModal
    if (role === "purchasing") {
        return [
            ...baseColumns,
            {
                field: "hargaModal",
                headerName: "Harga Modal",
                width: 150,
                description: "harga modal produk",
                valueGetter: params => {
                    const price = params.row.hargaModal;
                    return price > 0 ? `Rp ${Number(price).toLocaleString("id-ID")}` : "-";
                }
            },
            {
                field: "price",
                headerName: "Harga Jual",
                width: 150,
                description: "harga jual produk",
                valueGetter: params => {
                    const price = params.row.price;
                    return price > 0 ? `Rp ${Number(price).toLocaleString("id-ID")}` : "-";
                }
            }
        ];
    }

    // MARKETING: Lihat id, productName, category, price (hargaJual), stock
    if (role === "marketing") {
        return [
            ...baseColumns,
            {
                field: "price",
                headerName: "Harga Jual",
                width: 150,
                description: "harga jual produk",
                valueGetter: params => {
                    const price = params.row.price;
                    return price > 0 ? `Rp ${Number(price).toLocaleString("id-ID")}` : "-";
                }
            }
        ];
    }

    return baseColumns;
};
