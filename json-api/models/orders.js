const mongoose = require("mongoose");
const {nanoid} = require("nanoid"); // 🔹 untuk membuat id unik pendek

const orderSchema = new mongoose.Schema(
    {
        id: {type: String, unique: true}, // otomatis nanti diisi
        customer: String,
        dateCreated: {type: String, default: () => new Date().toISOString()},
        products: [
            {
                productName: String,
                productAmount: Number
            }
        ],
        status: {type: String, default: "pending"},
        acceptedAt: String,
        returnDate: String
    },
    {versionKey: false}
);

// 🔹 Auto-generate id sebelum data disimpan
orderSchema.pre("save", function (next) {
    if (!this.id) {
        this.id = `ORD-${nanoid(6)}`; // contoh: ORD-A1B2C3
    }
    next();
});

module.exports = mongoose.model("Order", orderSchema);
