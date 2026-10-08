const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, "Email Is Not Valid"],
        trim: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]

    },
    otpHash: {
        type: String,
        required: [true, "OTP Hash is required"]
    },
    expiresAt: {
        type: Date,
        required: [true, "Expires at is required"]
    }

}, {
    timestamps: true
}
)

const otpModel = mongoose.model("Otp", otpSchema);

module.exports = otpModel;
