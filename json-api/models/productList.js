const mongoose = require("mongoose");
const {nanoid} = require("nanoid"); // 🔹 untuk membuat id unik pendek

const productSchema = new mongoose.Schema(
    {
        id: {type: String, unique: true}, // 🔹 AUTO-GENERATE (bukan manual lagi)
        productName: String,
        category: String,
        stock: Number,
        quantityType: String,
        price: Number,
        hargaModal: Number
    },
    {versionKey: false}
);

// 🔹 AUTO-GENERATE id sebelum data disimpan (seperti di orders.js)
productSchema.pre("save", function (next) {
    if (!this.id) {
        this.id = `PRD-${nanoid(6)}`; // contoh: PRD-A1B2C3
    }
    next();
});

module.exports = mongoose.model("ProductList", productSchema);
