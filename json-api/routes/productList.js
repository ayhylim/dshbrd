const express = require("express");
const router = express.Router();
const Product = require("../models/productList");

// 🟢 HELPER: Filter fields berdasarkan role
const filterProductByRole = (product, role) => {
    if (!product) return null;

    const productObj = product.toObject ? product.toObject() : product;

    switch (role) {
        case "warehouse":
            // Warehouse: Lihat id, productName, category, stock, quantityType (❌ NO price, NO hargaModal)
            return {
                id: productObj.id,
                productName: productObj.productName,
                category: productObj.category,
                stock: productObj.stock,
                quantityType: productObj.quantityType
            };

        case "purchasing":
            // Purchasing: Lihat semua fields termasuk price & hargaModal
            return productObj;

        case "marketing":
            // Marketing: Lihat id, productName, category, price (hargaJual), stock
            return {
                id: productObj.id,
                productName: productObj.productName,
                category: productObj.category,
                price: productObj.price,
                stock: productObj.stock,
                quantityType: productObj.quantityType
            };

        default:
            return null;
    }
};

// GET all products dengan filtering berdasarkan role
router.get("/", async (req, res) => {
    try {
        const role = req.query.role || "marketing"; // Default: marketing (least access)
        const products = await Product.find();

        const filteredProducts = products.map(product => filterProductByRole(product, role));

        res.json(filteredProducts);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({error: "Error fetching products"});
    }
});

// POST - Hanya WAREHOUSE yang bisa create product
router.post("/", async (req, res) => {
    try {
        const role = req.query.role || req.body.role;

        if (role !== "warehouse") {
            return res.status(403).json({error: "Only warehouse can create products"});
        }

        // Warehouse hanya bisa input: id, productName, category, stock, quantityType
        const newProduct = await Product.create({
            id: req.body.id,
            productName: req.body.productName,
            category: req.body.category,
            stock: req.body.stock,
            quantityType: req.body.quantityType,
            price: 0, // Default 0 (harga jual)
            hargaModal: 0 // Default 0 (harga modal)
        });

        res.status(201).json(filterProductByRole(newProduct, role));
    } catch (err) {
        console.error("Error creating product:", err);
        res.status(500).json({error: "Error creating product"});
    }
});

// PUT - Different logic per role
router.put("/:id", async (req, res) => {
    try {
        const role = req.query.role || req.body.role;
        const product = await Product.findOne({id: req.params.id});

        if (!product) {
            return res.status(404).json({error: "Product not found"});
        }

        // 🟢 WAREHOUSE: Hanya bisa edit productName, category, stock, quantityType
        if (role === "warehouse") {
            console.log(`🔧 Warehouse editing product ${req.params.id}`);

            const updated = await Product.findOneAndUpdate(
                {id: req.params.id},
                {
                    productName: req.body.productName !== undefined ? req.body.productName : product.productName,
                    category: req.body.category !== undefined ? req.body.category : product.category,
                    stock: req.body.stock !== undefined ? req.body.stock : product.stock,
                    quantityType: req.body.quantityType !== undefined ? req.body.quantityType : product.quantityType
                    // 🚫 TIDAK boleh edit price & hargaModal
                },
                {new: true}
            );
            console.log("✅ Product updated by warehouse");
            return res.json(filterProductByRole(updated, role));
        }

        // 🟢 PURCHASING: Bisa edit BOTH price (hargaJual) & hargaModal (preserve field lain)
        if (role === "purchasing") {
            console.log(`💰 Purchasing setting harga for product ${req.params.id}`);

            // 🟢 IMPORTANT: Explicit preserve ALL existing fields, only update price & hargaModal
            const updated = await Product.findOneAndUpdate(
                {id: req.params.id},
                {
                    productName: product.productName, // 🔴 FIX: Explicit preserve
                    category: product.category, // 🔴 FIX: Explicit preserve
                    stock: product.stock, // 🔴 FIX: Explicit preserve
                    quantityType: product.quantityType, // 🔴 FIX: Explicit preserve
                    price: req.body.price !== undefined ? req.body.price : product.price,
                    hargaModal: req.body.hargaModal !== undefined ? req.body.hargaModal : product.hargaModal
                },
                {new: true}
            );

            console.log("✅ Prices updated by purchasing, fields preserved:", updated);
            // 🟢 IMPORTANT: Return FULL object untuk Purchasing (jangan filter)
            // Karena frontend perlu semua data untuk display & state update
            return res.json(updated.toObject ? updated.toObject() : updated);
        }

        // MARKETING: Tidak boleh edit apapun
        if (role === "marketing") {
            return res.status(403).json({error: "Marketing role cannot edit products"});
        }

        return res.status(403).json({error: "Unauthorized role"});
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({error: "Error updating product"});
    }
});

// DELETE - Hanya WAREHOUSE yang bisa delete
router.delete("/:id", async (req, res) => {
    try {
        const role = req.query.role || req.body.role;

        if (role !== "warehouse") {
            return res.status(403).json({error: "Only warehouse can delete products"});
        }

        await Product.findOneAndDelete({id: req.params.id});
        res.status(204).send();
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({error: "Error deleting product"});
    }
});

module.exports = router;
