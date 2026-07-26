const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        date: {
            type: Date,
            required: true
        },
        time: {
            type: String,
            required: true
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
        
        availableCapacity: {
         type: Number,
         required: true,
         min: 0
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },
        type: {
            type: String,
            enum: ["cata", "feria", "festival", "visita", "otro"],
            default: "otro"
        },
        winery: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Winery",
            required: true
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["activo", "cancelado", "finalizado"],
            default: "activo"
        }
    },
    {
        timestamps: true
    }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;