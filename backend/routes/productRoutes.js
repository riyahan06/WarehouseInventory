const express = require("express");
const Product = require("../models/Product");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();
const canManageProducts = allowRoles("Admin", "Warehouse Staff");

// All signed-in roles can view products.
router.get("/", verifyToken, async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin and Warehouse Staff can add products.
router.post("/", verifyToken, canManageProducts, async (req, res) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Admin and Warehouse Staff can update products.
router.put("/:id", verifyToken, canManageProducts, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedProduct) return res.status(404).json({ message: "Product not found." });
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Only Admin can delete products.
router.delete("/:id", verifyToken, allowRoles("Admin"), async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: "Product not found." });
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
