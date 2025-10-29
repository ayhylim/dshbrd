const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        id: {type: String, required: true, unique: true}, // id manual oleh admin
        productName: String,
        category: String,
        price: Number,
        stock: Number
    },
    {versionKey: false} // ✅ tetap hilangkan __v tapi jangan hapus _id
);

module.exports = mongoose.model("ProductList", productSchema);
