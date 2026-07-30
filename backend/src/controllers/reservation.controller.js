const reservationService = require("../services/reservation.service");

const createReservation = async (req, res) => {
    try {
        const reservation = await reservationService.createReservation(req.body, req.user);

        res.status(201).json({
            success: true,
            message: "Reserva creada correctamente",
            data: reservation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getMyReservations = async (req, res) => {
    try {
        const reservations = await reservationService.getMyReservations(req.user);

        res.status(200).json({
            success: true,
            data: reservations
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getReservationById = async (req, res) => {
    try {
        const reservation = await reservationService.getReservationById(
            req.params.id,
            req.user
        );

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const cancelReservation = async (req, res) => {
    try {
        const reservation = await reservationService.cancelReservation(
            req.params.id,
            req.user
        );

        res.status(200).json({
            success: true,
            message: "Reserva cancelada correctamente",
            data: reservation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createReservation,
    getMyReservations,
    getReservationById,
    cancelReservation

};