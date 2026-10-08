const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]

    },
    type: {
        type: String,
        enum: ["LOGIN", "PASSWORD_RESET"],
        default: "LOGIN"
    },
    refreshTokenHash: {
        type: String,
        required: function () {
            return this.type === "LOGIN";
        }
    },
    resetSessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        required: function () {
            return this.type === "PASSWORD_RESET";
        }
    },
    ip: {
        type: String,
        required: false
    },
    userAgent: {
        type: String,
        required: false
    },
    revoked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const sessionModel = mongoose.model("Session", sessionSchema);

module.exports = sessionModel;
