const express = require("express");
const router = express.Router();
const ProductHistory = require("../models/productHistory");
const {nanoid} = require("nanoid");

// GET all history
router.get("/", async (req, res) => {
    try {
        const histories = await ProductHistory.find().sort({dateAdded: -1});
        res.json(histories);
    } catch (err) {
        console.error("Error fetching history:", err);
        res.status(500).json({error: "Error fetching history"});
    }
});

// POST - Add new history entry
router.post("/", async (req, res) => {
    try {
        const newHistory = await ProductHistory.create({
            id: `HIST-${nanoid(6)}`,
            productId: req.body.productId,
            productName: req.body.productName,
            category: req.body.category,
            addedBy: req.body.addedBy || "system",
            dateAdded: new Date().toISOString(),
            stock: req.body.stock,
            quantityType: req.body.quantityType
        });

        res.status(201).json(newHistory);
    } catch (err) {
        console.error("Error creating history:", err);
        res.status(500).json({error: err.message});
    }
});

// DELETE - Clear history (optional)
router.delete("/:id", async (req, res) => {
    try {
        await ProductHistory.findOneAndDelete({id: req.params.id});
        res.status(204).send();
    } catch (err) {
        console.error("Error deleting history:", err);
        res.status(500).json({error: "Error deleting history"});
    }
});

module.exports = router;
