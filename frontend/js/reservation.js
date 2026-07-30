(() => {
  const API_URL = "http://localhost:3000/api";

  let selectedEvent = null;

  document.addEventListener("DOMContentLoaded", () => {
    initializeReservationPage();
  });

  const initializeReservationPage = async () => {
    if (typeof requireRole === "function") {
      requireRole("cliente");
    }

    const token = getStoredToken();
    const user = getStoredUser();

    if (!token || !user || user.role !== "cliente") {
      redirectToLogin();
      return;
    }

    configurePageEvents();

    const eventId = getEventIdFromUrl();

    if (!eventId) {
      showLoadingError(
        "No se recibió el identificador del evento."
      );

      disableReservationForm();
      return;
    }

    await loadEvent(eventId);
  };

  const configurePageEvents = () => {
    const quantityInput =
      document.getElementById("people-quantity");

    const reservationForm =
      document.getElementById("reservation-form");

    const logoutButton =
      document.getElementById("logout-button");

    if (quantityInput) {
      quantityInput.addEventListener(
        "input",
        handleQuantityChange
      );
    }

    if (reservationForm) {
      reservationForm.addEventListener(
        "submit",
        createReservation
      );
    }

    if (logoutButton) {
      logoutButton.addEventListener(
        "click",
        logout
      );
    }
  };

  const getEventIdFromUrl = () => {
    const urlParameters =
      new URLSearchParams(window.location.search);

    return urlParameters.get("eventId");
  };

  const loadEvent = async (eventId) => {
    try {
      const response = await fetch(
        `${API_URL}/events/${eventId}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "No se pudo obtener el evento"
        );
      }

      selectedEvent = result.data;

      renderEvent(selectedEvent);
      configureQuantityInput(selectedEvent);
      updateReservationTotal();
    } catch (error) {
      showLoadingError(error.message);
      disableReservationForm();
    }
  };

  const renderEvent = (event) => {
    setTextContent(
      "event-type",
      formatEventType(event.type)
    );

    setTextContent(
      "event-name",
      event.name || "Evento sin nombre"
    );

    setTextContent(
      "event-description",
      event.description || "Sin descripción"
    );

    setTextContent(
      "event-date",
      formatDate(event.date)
    );

    setTextContent(
      "event-time",
      event.time || "Horario no informado"
    );

    setTextContent(
      "event-location",
      event.location || "Ubicación no informada"
    );

    setTextContent(
      "event-winery",
      getWineryName(event.winery)
    );

    setTextContent(
      "event-capacity",
      `${getAvailableCapacity(event)} lugares disponibles`
    );

    setTextContent(
      "event-price",
      `${formatPrice(event.price)} por persona`
    );

    const loadingElement =
      document.getElementById(
        "reservation-loading"
      );

    const contentElement =
      document.getElementById(
        "reservation-event-content"
      );

    if (loadingElement) {
      loadingElement.hidden = true;
    }

    if (contentElement) {
      contentElement.hidden = false;
    }
  };

  const configureQuantityInput = (event) => {
    const quantityInput =
      document.getElementById("people-quantity");

    if (!quantityInput) {
      return;
    }

    const availableCapacity =
      getAvailableCapacity(event);

    quantityInput.min = "1";
    quantityInput.max = String(availableCapacity);
    quantityInput.step = "1";

    if (availableCapacity > 0) {
      quantityInput.value = "1";
    } else {
      quantityInput.value = "0";
    }

    if (
      availableCapacity <= 0 ||
      event.status !== "activo"
    ) {
      quantityInput.disabled = true;

      disableReservationForm();

      showMessage(
        availableCapacity <= 0
          ? "Este evento ya no tiene lugares disponibles."
          : "Este evento no se encuentra activo.",
        "error"
      );
    }
  };

  const handleQuantityChange = () => {
    clearMessage();
    validateQuantity();
    updateReservationTotal();
  };

  const validateQuantity = () => {
    if (!selectedEvent) {
      showMessage(
        "No se pudo identificar el evento.",
        "error"
      );

      return false;
    }

    const quantityInput =
      document.getElementById("people-quantity");

    if (!quantityInput) {
      return false;
    }

    const quantity =
      Number(quantityInput.value);

    const availableCapacity =
      getAvailableCapacity(selectedEvent);

    if (!quantityInput.value) {
      showMessage(
        "Ingresá la cantidad de personas.",
        "error"
      );

      return false;
    }

    if (!Number.isInteger(quantity)) {
      showMessage(
        "La cantidad de personas debe ser un número entero.",
        "error"
      );

      return false;
    }

    if (quantity < 1) {
      showMessage(
        "La reserva debe ser para al menos una persona.",
        "error"
      );

      return false;
    }

    if (quantity > availableCapacity) {
      showMessage(
        `Solo quedan ${availableCapacity} lugares disponibles.`,
        "error"
      );

      return false;
    }

    return true;
  };

  const updateReservationTotal = () => {
    const totalElement =
      document.getElementById(
        "reservation-total"
      );

    const quantityInput =
      document.getElementById(
        "people-quantity"
      );

    if (
      !totalElement ||
      !quantityInput ||
      !selectedEvent
    ) {
      return;
    }

    const quantity =
      Number(quantityInput.value);

    const price =
      Number(selectedEvent.price);

    const total =
      Number.isInteger(quantity) &&
      quantity > 0 &&
      Number.isFinite(price)
        ? quantity * price
        : 0;

    totalElement.textContent =
      formatPrice(total);
  };

  const createReservation = async (event) => {
    event.preventDefault();

    clearMessage();

    if (!selectedEvent) {
      showMessage(
        "No se pudo identificar el evento.",
        "error"
      );

      return;
    }

    if (!validateQuantity()) {
      return;
    }

    const quantityInput =
      document.getElementById(
        "people-quantity"
      );

    if (!quantityInput) {
      return;
    }

    const peopleQuantity =
      Number(quantityInput.value);

    window.location.href =
      `./payment.html?eventId=${encodeURIComponent(selectedEvent._id)}` +
      `&people=${encodeURIComponent(peopleQuantity)}`;
  };

  const setButtonLoading = (
    button,
    isLoading
  ) => {
    if (!button) {
      return;
    }

    button.disabled = isLoading;

    button.textContent = isLoading
      ? "Procesando..."
      : "Continuar al pago";
  };

  const setButtonSuccess = (button) => {
    if (!button) {
      return;
    }

    button.disabled = true;
    button.textContent = "✓ Reserva realizada";
  };

  const disableReservationForm = () => {
    const confirmButton =
      document.getElementById(
        "confirm-reservation-button"
      );

    if (confirmButton) {
      confirmButton.disabled = true;
    }
  };

  const showLoadingError = (message) => {
    const loadingElement =
      document.getElementById(
        "reservation-loading"
      );

    const contentElement =
      document.getElementById(
        "reservation-event-content"
      );

    if (loadingElement) {
      loadingElement.hidden = false;
      loadingElement.textContent = message;
    }

    if (contentElement) {
      contentElement.hidden = true;
    }

    showMessage(
      message,
      "error"
    );
  };

  const showMessage = (
    message,
    type
  ) => {
    const messageElement =
      document.getElementById(
        "reservation-message"
      );

    if (!messageElement) {
      return;
    }

    messageElement.textContent =
      message;

    messageElement.className =
      `form-message ${type}`;

    messageElement.hidden = false;
  };

  const clearMessage = () => {
    const messageElement =
      document.getElementById(
        "reservation-message"
      );

    if (!messageElement) {
      return;
    }

    messageElement.textContent = "";
    messageElement.className =
      "form-message";

    messageElement.hidden = true;
  };

  const setTextContent = (
    elementId,
    value
  ) => {
    const element =
      document.getElementById(elementId);

    if (element) {
      element.textContent = value;
    }
  };

  const getAvailableCapacity = (event) => {
    return Number(
      event.availableCapacity ??
      event.capacity ??
      0
    );
  };

  const getWineryName = (winery) => {
    if (!winery) {
      return "Bodega no informada";
    }

    if (typeof winery === "string") {
      return "Bodega asociada";
    }

    return (
      winery.name ||
      "Bodega no informada"
    );
  };

  const formatEventType = (type) => {
    if (!type) {
      return "Evento";
    }

    return (
      type.charAt(0).toUpperCase() +
      type.slice(1)
    );
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat(
      "es-AR",
      {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
      }
    ).format(
      Number(value) || 0
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "Fecha no informada";
    }

    return new Intl.DateTimeFormat(
      "es-AR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
      }
    ).format(
      new Date(date)
    );
  };

  const getStoredToken = () => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  };

  const getStoredUser = () => {
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    window.location.href =
      "../index.html";
  };

  const redirectToLogin = () => {
    window.location.href =
      "./login.html";
  };
})();