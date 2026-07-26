const Event = require("../models/event.model");

const createEvent = async (eventData) => {
    return await Event.create(eventData);
};

const findAllEvents = async () => {
    return await Event.find()
        .populate("winery", "name location")
        .populate("organizer", "firstName lastName email");
};

const findEventById = async (eventId) => {
    return await Event.findById(eventId);
};

const findEventsByOrganizer = async (organizerId) => {
    return await Event.find({ organizer: organizerId })
        .populate("winery", "name location")
        .sort({ date: 1 });
};

const updateEventById = async (eventId, updateData) => {
    return await Event.findByIdAndUpdate(eventId, updateData, {
        new: true,
        runValidators: true
    });
};

module.exports = {
    createEvent,
    findAllEvents,
    findEventById,
    findEventsByOrganizer,
    updateEventById
};