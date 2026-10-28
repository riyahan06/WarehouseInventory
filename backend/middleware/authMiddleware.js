const jwt = require("jsonwebtoken");

const ALLOWED_ROLES = ["Admin", "Warehouse Staff", "Viewer"];

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({ message: "Authentication required." });
    }
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not configured.");
        return res.status(500).json({ message: "Server authentication is not configured." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.id || !ALLOWED_ROLES.includes(decoded.role)) {
            return res.status(401).json({ message: "Invalid authentication token." });
        }
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}

function allowRoles(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "You do not have permission to perform this action." });
        }
        next();
    };
}

module.exports = { verifyToken, allowRoles };
