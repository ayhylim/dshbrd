const express = require("express");
const router = express.Router();
const Product = require("../models/productList");

// GET all
router.get("/", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// POST
router.post("/", async (req, res) => {
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
});

// PUT
router.put("/:id", async (req, res) => {
    const updated = await Product.findOneAndUpdate({id: req.params.id}, req.body, {new: true});
    res.json(updated);
});

// DELETE
router.delete("/:id", async (req, res) => {
    await Product.findOneAndDelete({id: req.params.id});
    res.status(204).send();
});

module.exports = router;
