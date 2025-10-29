const mongoose = require("mongoose");
const {nanoid} = require("nanoid"); // 🔹 untuk membuat id unik pendek

const transactionSchema = new mongoose.Schema(
    {
        id: {type: String, unique: true},
        originalOrderId: String,
        customer: String,
        dateCreated: String,
        status: String,
        transactionType: String,
        refundAmount: Number,
        products: [
            {
                productName: String,
                productPrice: Number,
                productAmount: Number
            }
        ]
    },
    {versionKey: false}
);

// 🔹 Auto-generate id sebelum data disimpan
transactionSchema.pre("save", function (next) {
    if (!this.id) {
        this.id = `ORD-${nanoid(6)}`; // contoh: ORD-A1B2C3
    }
    next();
});

module.exports = mongoose.model("TransactionLog", transactionSchema);
