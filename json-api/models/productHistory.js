const mongoose = require("mongoose");

const productHistorySchema = new mongoose.Schema(
    {
        id: {type: String, unique: true},
        productId: String,
        productName: String,
        category: String,
        addedBy: String, // role atau user yang menambah
        dateAdded: {type: String, default: () => new Date().toISOString()},
        stock: Number,
        quantityType: String
    },
    {versionKey: false}
);

module.exports = mongoose.model("ProductHistory", productHistorySchema);
