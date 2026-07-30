(() => {
  const API_URL = "http://localhost:3000/api";
  let selectedEvent = null;
  let peopleQuantity = 0;

  document.addEventListener("DOMContentLoaded", initializePaymentPage);

  async function initializePaymentPage() {
    const user = requireRole("cliente");
    if (!user) return;

    document.getElementById("logout-button").addEventListener("click", () => {
      clearSession();
      window.location.href = "../index.html";
    });

    document.getElementById("back-button").addEventListener("click", () => history.back());
    document.getElementById("payment-form").addEventListener("submit", confirmPayment);

    document.querySelectorAll('input[name="paymentMethod"]').forEach((input) => {
      input.addEventListener("change", updatePaymentFields);
    });

    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("eventId");
    peopleQuantity = Number(params.get("people"));

    if (!eventId || !Number.isInteger(peopleQuantity) || peopleQuantity < 1) {
      showMessage("Los datos de la reserva no son válidos.", "error");
      disableForm();
      return;
    }

    await loadEvent(eventId);
  }

  async function loadEvent(eventId) {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "No se pudo cargar el evento");
      }

      selectedEvent = result.data;
      const available = Number(selectedEvent.availableCapacity ?? selectedEvent.capacity ?? 0);

      if (selectedEvent.status !== "activo" || peopleQuantity > available) {
        throw new Error("El evento ya no tiene disponibilidad para esa cantidad de personas.");
      }

      renderSummary();
    } catch (error) {
      document.getElementById("payment-loading").textContent = error.message;
      showMessage(error.message, "error");
      disableForm();
    }
  }

  function renderSummary() {
    setText("payment-event-name", selectedEvent.name);
    setText("payment-event-date", formatDate(selectedEvent.date));
    setText("payment-event-time", selectedEvent.time || "No informado");
    setText("payment-event-location", selectedEvent.location || "No informada");
    setText("payment-people", peopleQuantity);
    setText("payment-unit-price", formatPrice(selectedEvent.price));
    setText("payment-total", formatPrice(peopleQuantity * Number(selectedEvent.price)));

    document.getElementById("payment-loading").hidden = true;
    document.getElementById("payment-summary").hidden = false;
  }

  function updatePaymentFields() {
    const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    document.getElementById("card-demo-fields").hidden = method !== "tarjeta";
  }

  async function confirmPayment(event) {
    event.preventDefault();
    if (!selectedEvent) return;

    const token = getStoredToken();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    const button = document.getElementById("confirm-payment-button");

    if (!token || !paymentMethod || button.disabled) return;

    try {
      button.disabled = true;
      button.textContent = "Procesando pago simulado...";
      showMessage("Procesando la operación de demostración...", "success");

      const response = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          event: selectedEvent._id,
          peopleQuantity,
          paymentMethod
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "No se pudo confirmar la reserva");
      }

      button.textContent = "✓ Pago aprobado";
      showMessage("Pago simulado aprobado. Generando comprobante...", "success");

      setTimeout(() => {
        window.location.href = `./reservation-success.html?reservationId=${encodeURIComponent(result.data._id)}`;
      }, 1200);
    } catch (error) {
      button.disabled = false;
      button.textContent = "Confirmar pago y reservar";
      showMessage(error.message, "error");
    }
  }

  function disableForm() {
    document.getElementById("confirm-payment-button").disabled = true;
  }

  function showMessage(message, type) {
    const element = document.getElementById("payment-message");
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.hidden = false;
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function formatPrice(value) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency", currency: "ARS", maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit", month: "long", year: "numeric", timeZone: "UTC"
    }).format(new Date(value));
  }
})();
