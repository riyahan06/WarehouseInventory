const express = require("express");
const StockMovement = require("../models/StockMovement");
const Product = require("../models/Product");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// All signed-in roles can view movement history.
router.get("/", verifyToken, async (req, res) => {
    try {
        const movements = await StockMovement.find();
        res.json(movements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin and Warehouse Staff can record stock movements; Viewer is read-only.
router.post("/", verifyToken, allowRoles("Admin", "Warehouse Staff"), async (req, res) => {
    try {
        const { product, type, quantity } = req.body;
        if (!product || !["Stock In", "Stock Out"].includes(type)) {
            return res.status(400).json({ message: "A product and a valid movement type (Stock In or Stock Out) are required." });
        }
        const amount = Number(quantity);
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ message: "Quantity must be a number greater than 0." });
        }

        const existingProduct = await Product.findOne({ name: product });
        if (!existingProduct) return res.status(404).json({ message: "Product not found." });
        if (type === "Stock Out" && existingProduct.quantity < amount) {
            return res.status(400).json({ message: "Not enough stock available." });
        }

        if (type === "Stock In") existingProduct.quantity += amount;
        else existingProduct.quantity -= amount;
        await existingProduct.save();

        const movement = new StockMovement({ product, type, quantity: amount });
        const savedMovement = await movement.save();
        res.status(201).json(savedMovement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
