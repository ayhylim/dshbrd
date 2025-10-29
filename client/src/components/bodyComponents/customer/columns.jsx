import {Typography} from "@mui/material";

export const columns = [
    {
        field: "id",
        headerName: "No", // Diubah menjadi No (nomer urut list)
        width: 90,
        description: "id of the customer"
    },
    {
        field: "name", // Diubah dari 'fullname' menjadi 'name' untuk mencocokkan processedCustomers
        headerName: "Full Name",
        width: 300,
        description: "customer full name",
        renderCell: params => {
            return (
                // 💡 Tampilkan langsung nama yang sudah diolah
                <Typography variant="subtitle2" sx={{mx: 3}}>
                    {params.row.name}
                </Typography>
            );
        }
    },
    {
        field: "orderCount", // Properti baru dari hasil kalkulasi
        headerName: "Number Of Order",
        width: 200,
        description: "number of order that the customer made",
        valueGetter: params => params.row.orderCount
    },
    {
        field: "totalQuantity", // Properti baru dari hasil kalkulasi
        headerName: "Total QTY Ordered",
        width: 200,
        description: "total quantity of all products ordered by the customer",
        valueGetter: params => params.row.totalQuantity
    },
    {
        field: "lastOrderTime", // Gunakan nama field yang baru
        headerName: "Order Details (Last Order)",
        width: 300,
        description: "time and date the last order was made",
        valueGetter: params => params.row.lastOrderTime,
        renderCell: params => {
            const date = params.value;
            if (!date || isNaN(date)) return "N/A"; // Cek jika data tidak valid

            // Format tanggal ke format lokal yang mudah dibaca (misalnya: 16/10/2025, 09:32)
            return date.toLocaleString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false // Menggunakan format 24 jam
            });
        }
    }
];
