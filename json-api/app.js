require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const productRoutes = require("./routes/productList");
const orderRoutes = require("./routes/orders");
const transactionRoutes = require("./routes/transactionLog");
const productHistoryRoutes = require("./routes/productHistory");

const app = express();
app.use(express.json());
app.use(cors());

// 💡 Biar kompatibel dengan frontend-mu yang sudah ada:
app.use("/productList", productRoutes);
app.use("/orders", orderRoutes);
app.use("/transactionLog", transactionRoutes);
app.use("/productHistory", productHistoryRoutes);

const port = process.env.PORT || 3000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected");
        app.listen(port, () => console.log(`🚀 Server running on ${port}`));
    })
    .catch(err => console.error("❌ DB Connection Error:", err));
