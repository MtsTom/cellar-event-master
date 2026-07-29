const eventRepository = require("../repositories/event.repository");
const reservationRepository = require("../repositories/reservation.repository");

const ensureOrganizer = (user) => {
    if (user.role !== "organizador") {
        throw new Error("Solo los organizadores pueden gestionar eventos");
    }
};

const ensureEventOwner = (event, user) => {
    if (event.organizer.toString() !== user.id) {
        throw new Error("No podés modificar un evento que no te pertenece");
    }
};

const createEvent = async (eventData, user) => {
    ensureOrganizer(user);

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
    ensureOrganizer(user);

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
                        return total + reservation.peopleQuantity;
                    },
                    0
                );

            const revenue =
                confirmedReservationsList.reduce(
                    (total, reservation) => {
                        return total + reservation.totalPrice;
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

const updateEvent = async (eventId, eventData, user) => {
    ensureOrganizer(user);

    const event = await eventRepository.findEventById(eventId);

    if (!event) {
        throw new Error("El evento no existe");
    }

    ensureEventOwner(event, user);

    if (event.status !== "activo") {
        throw new Error("Solo se pueden editar eventos activos");
    }

    const newCapacity = Number(eventData.capacity);
    const reservedPeople = event.capacity - event.availableCapacity;

    if (newCapacity < reservedPeople) {
        throw new Error(
            `La capacidad no puede ser menor que las ${reservedPeople} personas ya reservadas`
        );
    }

    const updateData = {
        name: eventData.name,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        capacity: newCapacity,
        availableCapacity: newCapacity - reservedPeople,
        price: eventData.price,
        type: eventData.type,
        winery: eventData.winery
    };

    const updatedEvent = await eventRepository.updateEventById(
        eventId,
        updateData
    );

    await updatedEvent.populate("winery", "name location");

    return updatedEvent;
};

const cancelEvent = async (eventId, user) => {
    ensureOrganizer(user);

    const event = await eventRepository.findEventById(eventId);

    if (!event) {
        throw new Error("El evento no existe");
    }

    ensureEventOwner(event, user);

    if (event.status === "cancelado") {
        throw new Error("El evento ya está cancelado");
    }

    if (event.status === "finalizado") {
        throw new Error("No se puede cancelar un evento finalizado");
    }

    return await eventRepository.updateEventById(eventId, {
        status: "cancelado"
    });
};

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    getOrganizerEvents,
    updateEvent,
    cancelEvent
};
