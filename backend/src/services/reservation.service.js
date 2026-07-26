const reservationRepository = require("../repositories/reservation.repository");
const eventRepository = require("../repositories/event.repository");

const createReservation = async (reservationData, user) => {
    if (user.role !== "cliente") {
        throw new Error("Solo los clientes pueden reservar eventos");
    }

    const event = await eventRepository.findEventById(reservationData.event);

    if (!event) {
        throw new Error("El evento no existe");
    }

    if (event.status !== "activo") {
        throw new Error("No se puede reservar un evento que no está activo");
    }

    if (reservationData.peopleQuantity > event.availableCapacity) {
        throw new Error("No hay capacidad suficiente para esta reserva");
    }

    const totalPrice = reservationData.peopleQuantity * event.price;

    const reservation = await reservationRepository.createReservation({
        client: user.id,
        event: event._id,
        peopleQuantity: reservationData.peopleQuantity,
        totalPrice,
        status: "confirmada"
    });

    event.availableCapacity = event.availableCapacity - reservationData.peopleQuantity;
    await event.save();

    return reservation;
};

const getMyReservations = async (user) => {
    if (user.role !== "cliente") {
        throw new Error("Solo los clientes pueden ver sus reservas");
    }

    return await reservationRepository.findReservationsByClient(user.id);
};

const cancelReservation = async (reservationId, user) => {
    if (user.role !== "cliente") {
        throw new Error("Solo los clientes pueden cancelar reservas");
    }

    const reservation = await reservationRepository.findReservationById(reservationId);

    if (!reservation) {
        throw new Error("La reserva no existe");
    }

    if (reservation.client.toString() !== user.id) {
        throw new Error("No podés cancelar una reserva que no te pertenece");
    }

    if (reservation.status === "cancelada") {
        throw new Error("La reserva ya está cancelada");
    }

    const event = await eventRepository.findEventById(reservation.event);

    if (event) {
    const currentAvailableCapacity =
        typeof event.availableCapacity === "number"
            ? event.availableCapacity
            : event.capacity - reservation.peopleQuantity;

    event.availableCapacity = Math.min(
        currentAvailableCapacity + reservation.peopleQuantity,
        event.capacity
    );

    await event.save();
    }

    reservation.status = "cancelada";
    await reservation.save();

    return reservation;
};

module.exports = {
    createReservation,
    getMyReservations,
    cancelReservation
};