const Reservation = require("../models/reservation.model");

const createReservation = async (reservationData) => {
    return await Reservation.create(reservationData);
};

const findReservationsByClient = async (clientId) => {
    return await Reservation.find({ client: clientId })
        .populate("event", "name date time location price status");
};

const findReservationById = async (reservationId) => {
    return await Reservation.findById(reservationId);
};

const findReservationsByEvent = async (eventId) => {
    return await Reservation.find({
        event: eventId,
        status: "confirmada"
    });
};

module.exports = {
    createReservation,
    findReservationsByClient,
    findReservationById,
    findReservationsByEvent
};