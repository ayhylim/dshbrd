import Product from "./Product";

export const columns = [
    {
        field: "id",
        headerName: "ID",
        width: 90,
        description: "id of the product"
    },
    {
        field: "product",
        headerName: "Product",
        width: 300,
        description: "",
        //same here we have the cell data which i will get the value of the cells in the tables cellData.row.fieldName

        renderCell: cellData => {
            return <Product productName={cellData.row.productName} />; //this is just return name of the product
        }
    },
    {
        field: "category",
        headerName: "Category",
        width: 200,
        description: "category of the product"
    },
    {
        field: "price",
        headerName: "Price",
        width: 150,
        description: "price o f the product",
        valueGetter: params => `IDR ${params.row.price.toLocaleString("id-id")}`
    },
    {
        field: "stock",
        headerName: "Stock",
        width: 100,
        description: "how many items in the stock", // 💡 REVISI KRITIS: Mengambil nilai quantityType untuk ditampilkan
        valueGetter: params => {
            const stock = params.row.stock; // Jika quantityType ada, gunakan. Jika tidak, fallback ke "pcs".
            const unit = params.row.quantityType ? params.row.quantityType.toUpperCase() : "PCS";
            return `${stock} ${unit}`;
        }
    }
];
