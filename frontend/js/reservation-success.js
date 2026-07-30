(() => {
  const API_URL = "http://localhost:3000/api";

  document.addEventListener("DOMContentLoaded", initializeReceipt);

  async function initializeReceipt() {
    const user = requireRole("cliente");
    if (!user) return;

    document.getElementById("logout-button").addEventListener("click", () => {
      clearSession();
      window.location.href = "../index.html";
    });

    document.getElementById("print-receipt-button").addEventListener("click", () => window.print());

    const reservationId = new URLSearchParams(window.location.search).get("reservationId");
    if (!reservationId) {
      showError("No se recibió el identificador de la reserva.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
        headers: { Authorization: `Bearer ${getStoredToken()}` }
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "No se pudo cargar el comprobante");
      }

      renderReceipt(result.data);
    } catch (error) {
      showError(error.message);
    }
  }

  function renderReceipt(reservation) {
    const event = reservation.event || {};
    setText("receipt-code", reservation.reservationCode || reservation._id);
    setText("receipt-event", event.name || "Evento");
    setText("receipt-date", `${formatDate(event.date)}${event.time ? ` · ${event.time}` : ""}`);
    setText("receipt-location", event.location || "No informada");
    setText("receipt-people", reservation.peopleQuantity);
    setText("receipt-payment-method", formatPaymentMethod(reservation.paymentMethod));
    setText("receipt-payment-status", capitalize(reservation.paymentStatus || "aprobado"));
    setText("receipt-total", formatPrice(reservation.totalPrice));

    document.getElementById("receipt-loading").hidden = true;
    document.getElementById("receipt-card").hidden = false;
  }

  function showError(message) {
    document.getElementById("receipt-loading").textContent = message;
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function formatPaymentMethod(value) {
    const methods = {
      tarjeta: "Tarjeta (simulada)",
      transferencia: "Transferencia (simulada)",
      efectivo: "Efectivo en el lugar"
    };
    return methods[value] || "No informado";
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function formatPrice(value) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency", currency: "ARS", maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function formatDate(value) {
    if (!value) return "Fecha no informada";
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit", month: "long", year: "numeric", timeZone: "UTC"
    }).format(new Date(value));
  }
})();
