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
        paymentMethod: {
            type: String,
            enum: ["tarjeta", "transferencia", "efectivo"],
            default: "efectivo"
        },
        paymentStatus: {
            type: String,
            enum: ["pendiente", "aprobado"],
            default: "aprobado"
        },
        reservationCode: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
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