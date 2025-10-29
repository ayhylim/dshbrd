require("dotenv").config();
require("express-async-errors");

const connectDB = require("./db/connect");
const express = require("express");
const cors = require("cors");
const app = express();
const mainRouter = require("./routes/user");

// 🧠 Tambahkan konfigurasi CORS sebelum middleware lain
app.use(
    cors({
        origin: [
            "http://localhost:5173", // development frontend
            "https://tyotechinven.web.app", //Firebase ui
            "https://tmj-invenloginsstm.onrender.com", //backend login
            "https://tmj-productordertsl.onrender.com", // inventory backend
            "https://www.tyotechinven.web.app" //Firebase ui
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

// Parse JSON body
app.use(express.json());

app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    next();
});

// Routes
app.use("/api/v1", mainRouter);

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () => console.log(`✅ Server running on port ${port}`));
    } catch (error) {
        console.error("❌ Connection error:", error);
    }
};

start();
