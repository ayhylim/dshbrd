const express = require("express");
const router = express.Router();
const TransactionLog = require("../models/transactionLog");

// GET all
router.get("/", async (req, res) => {
    const TransactionLogs = await TransactionLog.find();
    res.json(TransactionLogs);
});

// POST
router.post("/", async (req, res) => {
    const newTransactionLog = await TransactionLog.create(req.body);
    res.status(201).json(newTransactionLog);
});

// PUT
router.put("/:id", async (req, res) => {
    const updated = await Transaction.findOneAndUpdate({id: req.params.id}, req.body, {new: true});
    res.json(updated);
});

// DELETE
router.delete("/:id", async (req, res) => {
    await Transaction.findOneAndDelete({id: req.params.id});
    res.status(204).send();
});

module.exports = router;
