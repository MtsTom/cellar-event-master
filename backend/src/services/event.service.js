const eventRepository = require("../repositories/event.repository");
const reservationRepository = require("../repositories/reservation.repository");

const createEvent = async (eventData, user) => {
    if (user.role !== "organizador") {
        throw new Error("Solo los organizadores pueden crear eventos");
    }

    return await eventRepository.createEvent({
        name: eventData.name,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        capacity: eventData.capacity,
        availableCapacity: eventData.capacity,
        price: eventData.price,
        type: eventData.type,
        winery: eventData.winery,
        organizer: user.id
    });
};

const getEvents = async () => {
    return await eventRepository.findAllEvents();
};

const getEventById = async (eventId) => {
    const event = await eventRepository.findEventById(eventId);

    if (!event) {
        throw new Error("El evento no existe");
    }

    await event.populate("winery", "name location");
    await event.populate(
        "organizer",
        "firstName lastName email"
    );

    return event;
};

const getOrganizerEvents = async (user) => {
    if (user.role !== "organizador") {
        throw new Error(
            "Solo los organizadores pueden acceder a este panel"
        );
    }

    const events =
        await eventRepository.findEventsByOrganizer(user.id);

    const organizerEvents = await Promise.all(
        events.map(async (event) => {
            const reservations =
                await reservationRepository
                    .findReservationsByEvent(event._id);

            const confirmedReservationsList =
                reservations.filter((reservation) => {
                    return reservation.status === "confirmada";
                });

            const confirmedReservations =
                confirmedReservationsList.length;

            const reservedPeople =
                confirmedReservationsList.reduce(
                    (total, reservation) => {
                        return (
                            total +
                            reservation.peopleQuantity
                        );
                    },
                    0
                );

            const revenue =
                confirmedReservationsList.reduce(
                    (total, reservation) => {
                        return (
                            total +
                            reservation.totalPrice
                        );
                    },
                    0
                );

            return {
                _id: event._id,
                name: event.name,
                description: event.description,
                date: event.date,
                time: event.time,
                location: event.location,
                capacity: event.capacity,
                availableCapacity: event.availableCapacity,
                price: event.price,
                type: event.type,
                status: event.status,
                winery: event.winery,
                confirmedReservations,
                reservedPeople,
                revenue
            };
        })
    );

    return organizerEvents;
};

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    getOrganizerEvents
};