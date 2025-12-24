const mongoose = require("mongoose");
const {nanoid} = require("nanoid");

const productSchema = new mongoose.Schema(
    {
        id: {type: String, unique: true},
        productName: String,
        category: String,
        stock: {
            type: Number,
            default: 0,
            min: [0, "Stock tidak boleh negatif"]
            // 💡 Tidak ada max value - bisa unlimited desimal
        },
        quantityType: String,
        price: {
            type: Number,
            default: 0,
            min: [0, "Price tidak boleh negatif"]
        },
        hargaModal: {
            type: Number,
            default: 0,
            min: [0, "Harga Modal tidak boleh negatif"]
        }
    },
    {versionKey: false}
);

// Auto-generate id sebelum data disimpan
productSchema.pre("save", function (next) {
    if (!this.id) {
        this.id = `PRD-${nanoid(6)}`;
    }
    next();
});

// 💡 Validasi tambahan: pastikan semua angka adalah number (tidak string)
productSchema.pre("save", function (next) {
    // Konversi ke number jika string
    if (typeof this.stock === "string") {
        this.stock = parseFloat(this.stock);
    }
    if (typeof this.price === "string") {
        this.price = parseFloat(this.price);
    }
    if (typeof this.hargaModal === "string") {
        this.hargaModal = parseFloat(this.hargaModal);
    }

    // Validasi NaN
    if (isNaN(this.stock)) this.stock = 0;
    if (isNaN(this.price)) this.price = 0;
    if (isNaN(this.hargaModal)) this.hargaModal = 0;

    next();
});

module.exports = mongoose.model("ProductList", productSchema);
