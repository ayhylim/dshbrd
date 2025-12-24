const mongoose = require("mongoose");
const {nanoid} = require("nanoid");

const transactionSchema = new mongoose.Schema(
    {
        id: {type: String, unique: true},
        originalOrderId: String,
        customer: String,
        dateCreated: String,
        acceptedAt: String,
        status: String,
        transactionType: String,
        refundAmount: {
            type: Number,
            default: 0,
            min: [0, "Refund tidak boleh negatif"]
        },
        products: [
            {
                productName: String,
                productPrice: {
                    type: Number,
                    default: 0,
                    min: [0, "Price tidak boleh negatif"]
                },
                productAmount: {
                    type: Number,
                    min: [0, "Jumlah produk tidak boleh negatif"]
                    // 💡 Bisa float, tidak ada max decimal
                }
            }
        ]
    },
    {versionKey: false}
);

// Auto-generate id sebelum data disimpan
transactionSchema.pre("save", function (next) {
    if (!this.id) {
        this.id = `TRX-${nanoid(6)}`;
    }

    // 💡 Validasi & konversi semua number fields ke float
    if (this.products && Array.isArray(this.products)) {
        this.products.forEach(product => {
            // Konversi productAmount
            if (typeof product.productAmount === "string") {
                product.productAmount = parseFloat(product.productAmount);
            }
            if (isNaN(product.productAmount)) {
                product.productAmount = 0;
            }

            // Konversi productPrice
            if (typeof product.productPrice === "string") {
                product.productPrice = parseFloat(product.productPrice);
            }
            if (isNaN(product.productPrice)) {
                product.productPrice = 0;
            }
        });
    }

    // Konversi refundAmount
    if (typeof this.refundAmount === "string") {
        this.refundAmount = parseFloat(this.refundAmount);
    }
    if (isNaN(this.refundAmount)) {
        this.refundAmount = 0;
    }

    next();
});

module.exports = mongoose.model("TransactionLog", transactionSchema);
