const express = require("express");
const router = express.Router();
const Product = require("../models/productList");

// 🟢 HELPER: Filter fields berdasarkan role
const filterProductByRole = (product, role) => {
    if (!product) return null;

    const productObj = product.toObject ? product.toObject() : product;

    switch (role) {
        case "warehouse":
            return {
                id: productObj.id,
                productName: productObj.productName,
                category: productObj.category,
                stock: productObj.stock,
                quantityType: productObj.quantityType
            };

        case "purchasing":
            return productObj;

        case "marketing":
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

// 💡 HELPER: Validasi dan konversi number field ke float
const validateFloatField = (value, fieldName) => {
    if (value === undefined || value === null || value === "") {
        return 0;
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
        throw new Error(`${fieldName} harus berupa angka (integer atau desimal)`);
    }

    if (numValue < 0) {
        throw new Error(`${fieldName} tidak boleh negatif`);
    }

    return numValue;
};

// GET all products dengan filtering berdasarkan role
router.get("/", async (req, res) => {
    try {
        const role = req.query.role || "marketing";
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

        // 💡 Validasi dan konversi ke float
        const stock = validateFloatField(req.body.stock, "Stock");

        const newProduct = await Product.create({
            id: req.body.id,
            productName: req.body.productName,
            category: req.body.category,
            stock: stock,
            quantityType: req.body.quantityType,
            price: 0,
            hargaModal: 0
        });

        res.status(201).json(filterProductByRole(newProduct, role));
    } catch (err) {
        console.error("Error creating product:", err);
        res.status(500).json({error: err.message || "Error creating product"});
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

            // 💡 Validasi stock jika ada input
            let newStock = product.stock;
            if (req.body.stock !== undefined) {
                newStock = validateFloatField(req.body.stock, "Stock");
            }

            const updated = await Product.findOneAndUpdate(
                {id: req.params.id},
                {
                    productName: req.body.productName !== undefined ? req.body.productName : product.productName,
                    category: req.body.category !== undefined ? req.body.category : product.category,
                    stock: newStock,
                    quantityType: req.body.quantityType !== undefined ? req.body.quantityType : product.quantityType
                },
                {new: true}
            );
            console.log("✅ Product updated by warehouse");
            return res.json(filterProductByRole(updated, role));
        }

        // 🟢 PURCHASING: Bisa edit price & hargaModal
        if (role === "purchasing") {
            console.log(`💰 Purchasing setting harga for product ${req.params.id}`);

            // 💡 Validasi price dan hargaModal jika ada input
            let newPrice = product.price;
            let newHargaModal = product.hargaModal;

            if (req.body.price !== undefined) {
                newPrice = validateFloatField(req.body.price, "Price");
            }
            if (req.body.hargaModal !== undefined) {
                newHargaModal = validateFloatField(req.body.hargaModal, "Harga Modal");
            }

            const updated = await Product.findOneAndUpdate(
                {id: req.params.id},
                {
                    productName: product.productName,
                    category: product.category,
                    stock: product.stock,
                    quantityType: product.quantityType,
                    price: newPrice,
                    hargaModal: newHargaModal
                },
                {new: true}
            );

            console.log("✅ Prices updated by purchasing, fields preserved:", updated);
            return res.json(updated.toObject ? updated.toObject() : updated);
        }

        // MARKETING: Tidak boleh edit apapun
        if (role === "marketing") {
            return res.status(403).json({error: "Marketing role cannot edit products"});
        }

        return res.status(403).json({error: "Unauthorized role"});
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({error: err.message || "Error updating product"});
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
