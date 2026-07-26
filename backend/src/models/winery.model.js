const mongoose = require("mongoose");

const winerySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        capacity: {
            type: Number,
            required: true,
            min: 1
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        available: {
            type: Boolean,
            default: true
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Winery = mongoose.model("Winery", winerySchema);

module.exports = Winery;