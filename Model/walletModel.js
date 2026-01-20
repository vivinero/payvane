
const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true, // 1 user = 1 wallet
    },
    walletId: {
        type: String,
        required: true,
        unique: true,
    },
    balance: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

module.exports = mongoose.model("Wallet", walletSchema);
