const fs = require("fs");
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("./db/connect");
const Product = require("./models/productList");
const Order = require("./models/orders");
const Transaction = require("./models/transactionLog");

const migrate = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        const data = JSON.parse(fs.readFileSync("./db.json", "utf-8"));

        await Product.deleteMany({});
        await Order.deleteMany({});
        await Transaction.deleteMany({});

        await Product.insertMany(data.productList);
        await Order.insertMany(data.orders);
        await Transaction.insertMany(data.transactionLog);

        console.log("✅ Migration success!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
};

migrate();
