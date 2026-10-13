const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const hasValidUserId = (userId) =>
    typeof userId === "string" && mongoose.isValidObjectId(userId);

const userAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const cookieToken = req.cookies?.refreshtoken;

    // Check bearer token first, then cookie token
    const token = bearerToken || cookieToken;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized: Token missing",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!hasValidUserId(decoded.id || decoded._id)) {
            throw new Error("Token has an invalid user ID");
        }
        req.user = decoded;
        return next();
    } catch (error) {
        // Fallback: If bearer token failed, attempt verifying cookie token if different
        if (bearerToken && cookieToken && bearerToken !== cookieToken) {
            try {
                const decodedCookie = jwt.verify(cookieToken, process.env.JWT_SECRET);
                if (!hasValidUserId(decodedCookie.id || decodedCookie._id)) {
                    return res.status(401).json({
                        message: "Invalid or expired token",
                    });
                }
                req.user = decodedCookie;
                return next();
            } catch (err) {
                // ignore
            }
        }
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};


module.exports = {
    userAuth
};
