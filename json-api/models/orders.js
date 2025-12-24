const mongoose = require("mongoose");
const {nanoid} = require("nanoid");

const orderSchema = new mongoose.Schema(
    {
        id: {type: String, unique: true},
        customer: String,
        dateCreated: {type: String, default: () => new Date().toISOString()},
        products: [
            {
                productName: String,
                productAmount: {
                    type: Number,
                    min: [0, "Jumlah produk tidak boleh negatif"]
                    // 💡 Bisa float, tidak ada max decimal
                }
            }
        ],
        status: {type: String, default: "pending"},
        acceptedAt: String,
        returnDate: String
    },
    {versionKey: false}
);

// Auto-generate id sebelum data disimpan
orderSchema.pre("save", function (next) {
    if (!this.id) {
        this.id = `ORD-${nanoid(6)}`;
    }

    // 💡 Validasi & konversi productAmount ke number
    if (this.products && Array.isArray(this.products)) {
        this.products.forEach(product => {
            if (typeof product.productAmount === "string") {
                product.productAmount = parseFloat(product.productAmount);
            }
            if (isNaN(product.productAmount)) {
                product.productAmount = 0;
            }
        });
    }

    next();
});

module.exports = mongoose.model("Order", orderSchema);
