const express = require("express");
const router = express.Router();
const Order = require("../models/orders");

// GET all
router.get("/", async (req, res) => {
    const Orders = await Order.find();
    res.json(Orders);
});

// POST
router.post("/", async (req, res) => {
    const newOrder = await Order.create(req.body);
    res.status(201).json(newOrder);
});

// PUT
router.put("/:id", async (req, res) => {
    const updated = await Order.findOneAndUpdate({id: req.params.id}, req.body, {new: true});
    res.json(updated);
}); 

// PATCH
router.patch("/:id", async (req, res) => {
    try {
        const updated = await Order.findOneAndUpdate({id: req.params.id}, req.body, {new: true});

        if (!updated) {
            return res.status(404).json({message: "Order not found"});
        }

        res.json(updated);
    } catch (err) {
        console.error("Error updating order:", err);
        res.status(500).json({message: "Server error"});
    }
});

// DELETE
router.delete("/:id", async (req, res) => {
    await Order.findOneAndDelete({id: req.params.id});
    res.status(204).send();
});

module.exports = router;
