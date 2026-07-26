const eventService = require("../services/event.service");

const createEvent = async (req, res) => {
    try {
        const event = await eventService.createEvent(
            req.body,
            req.user
        );

        res.status(201).json({
            success: true,
            message: "Evento creado correctamente",
            data: event
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getEvents = async (req, res) => {
    try {
        const events = await eventService.getEvents();

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener eventos"
        });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await eventService.getEventById(
            req.params.id
        );

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

const getOrganizerEvents = async (req, res) => {
    try {
        const events = await eventService.getOrganizerEvents(
            req.user
        );

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    getOrganizerEvents
};