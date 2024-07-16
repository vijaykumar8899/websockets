const mongoose = require("mongoose");

let dataSchema = new mongoose.Schema({
    message: {
        required: true,
        type: String
    },
    id: {
        required: true,
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now // Set default value to current timestamp
    }
});

module.exports = mongoose.model("websocketModel", dataSchema);
