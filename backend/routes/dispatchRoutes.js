const express = require("express");
const Dispatch = require("../models/Dispatch");
const Product = require("../models/Product");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// All signed-in roles can view dispatch records.
router.get("/", verifyToken, async (req, res) => {
    try {
        const dispatches = await Dispatch.find();
        res.json(dispatches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin and Warehouse Staff can create dispatches; Viewer is read-only.
router.post("/", verifyToken, allowRoles("Admin", "Warehouse Staff"), async (req, res) => {
    try {
        const { product, quantity, destination } = req.body;
        if (!product || !destination) {
            return res.status(400).json({ message: "Product and destination are required." });
        }
        const amount = Number(quantity);
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ message: "Quantity must be a number greater than 0." });
        }

        const existingProduct = await Product.findOne({ name: product });
        if (!existingProduct) return res.status(404).json({ message: "Product not found." });
        if (existingProduct.quantity < amount) {
            return res.status(400).json({ message: "Not enough stock available." });
        }

        existingProduct.quantity -= amount;
        await existingProduct.save();
        const dispatch = new Dispatch({ product, quantity: amount, destination, status: "Dispatched" });
        const savedDispatch = await dispatch.save();
        res.status(201).json(savedDispatch);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
