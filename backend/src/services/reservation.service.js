const reservationRepository = require("../repositories/reservation.repository");
const eventRepository = require("../repositories/event.repository");

const createReservationCode = () => {
    const datePart = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();

    return `CEM-${datePart}-${randomPart}`;
};

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

    const allowedPaymentMethods = ["tarjeta", "transferencia", "efectivo"];

    if (!allowedPaymentMethods.includes(reservationData.paymentMethod)) {
        throw new Error("Seleccioná un medio de pago válido");
    }

    const totalPrice = reservationData.peopleQuantity * event.price;

    const reservation = await reservationRepository.createReservation({
        client: user.id,
        event: event._id,
        peopleQuantity: reservationData.peopleQuantity,
        totalPrice,
        status: "confirmada",
        paymentMethod: reservationData.paymentMethod,
        paymentStatus: "aprobado",
        reservationCode: createReservationCode()
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

const getReservationById = async (reservationId, user) => {
    if (user.role !== "cliente") {
        throw new Error("Solo los clientes pueden ver una reserva");
    }

    const reservation = await reservationRepository.findReservationDetailById(
        reservationId
    );

    if (!reservation) {
        throw new Error("La reserva no existe");
    }

    if (reservation.client._id.toString() !== user.id) {
        throw new Error("No podés ver una reserva que no te pertenece");
    }

    return reservation;
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
    getReservationById,
    cancelReservation
};