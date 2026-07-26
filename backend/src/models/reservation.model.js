const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },
        peopleQuantity: {
            type: Number,
            required: true,
            min: 1
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: ["pendiente", "confirmada", "cancelada"],
            default: "confirmada"
        },
        reservationDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const Reservation = mongoose.model("Reservation", reservationSchema);

module.exports = Reservation;