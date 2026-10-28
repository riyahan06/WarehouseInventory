
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const ALLOWED_ROLES = ["Admin", "Warehouse Staff", "Viewer"];

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
        return res.status(401).json({
            message: "Please log in first."
        });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired login session."
        });
    }
}

function adminOnly(req, res, next) {
    if (req.user.role !== "Admin") {
        return res.status(403).json({
            message: "Admin access required."
        });
    }
    next();
}

// Public registration always creates Warehouse Staff.
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || !password
        ) {
            return res.status(400).json({
                message: "Please fill in all fields."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Server authentication is not configured."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (await User.findOne({ email: normalizedEmail })) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "Warehouse Staff"
        });

        return res.status(201).json({
            message: "Registration successful. You can now log in."
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        console.error("Registration error:", error.message);
        return res.status(500).json({
            message: "Registration failed. Please try again."
        });
    }
});

// Login verifies the selected role against the database.
router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || !password
        ) {
            return res.status(400).json({
                message: "Please enter your email and password."
            });
        }

        if (typeof role !== "string" || !ALLOWED_ROLES.includes(role)) {
            return res.status(400).json({
                message: "Please select a valid role."
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Server authentication is not configured."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (
            !user ||
            !user.password ||
            !(await bcrypt.compare(password, user.password))
        ) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        if (user.role !== role) {
            return res.status(403).json({
                message: "These credentials do not belong to the selected role."
            });
        }

        const token = jwt.sign(
            { id: user._id.toString(), role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({
            message: "Login failed. Please try again."
        });
    }
});

// Create users — Admin only.
router.post("/", verifyToken, adminOnly, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || !password
        ) {
            return res.status(400).json({
                message: "Please fill in all fields."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }

        if (!ALLOWED_ROLES.includes(role)) {
            return res.status(400).json({
                message: "Please select a valid user role."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (await User.findOne({ email: normalizedEmail })) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: await bcrypt.hash(password, 10),
            role
        });

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        console.error("Create user error:", error.message);
        return res.status(500).json({
            message: "Could not create user. Please try again."
        });
    }
});

// List users — Admin only.
router.get("/", verifyToken, adminOnly, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        return res.json(users);
    } catch (error) {
        console.error("Fetch users error:", error.message);
        return res.status(500).json({
            message: "Could not retrieve users."
        });
    }
});

module.exports = router;
