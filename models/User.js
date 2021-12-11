const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: "string",
        required: true,
    },
    email: {
        type: "string",
        required: true,
        unique: true,
    },
    password: {
        type: "string",
        required: true,
    },
    avatar: {
        type: "string",
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = User = mongoose.model("user", UserSchema);