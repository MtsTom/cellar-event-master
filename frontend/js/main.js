const API_URL = "http://localhost:3000/api";

const eventsContainer =
  document.getElementById("eventsContainer");

const navbar =
  document.getElementById("navbar");

const loginLink =
  document.getElementById("loginLink");

const registerButton =
  document.getElementById("registerButton");

const getStoredUser = () => {
  const userData =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  if (!userData) {
    return null;
  }

  try {
    return JSON.parse(userData);
  } catch (error) {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    return null;
  }
};

const getStoredToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
};

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(price);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(date));
};

const getAvailableCapacity = (event) => {
  return (
    event.availableCapacity ??
    event.capacity ??
    0
  );
};

const createEventAction = (event) => {
  const currentUser = getStoredUser();
  const token = getStoredToken();

  const availableCapacity =
    getAvailableCapacity(event);

  if (availableCapacity <= 0) {
    return `
      <button
        class="btn secondary event-reserve-button"
        type="button"
        disabled
      >
        Sin lugares disponibles
      </button>
    `;
  }

  if (!currentUser || !token) {
    return `
      <a
        href="./pages/login.html"
        class="btn primary event-reserve-button"
      >
        Ingresar para reservar
      </a>
    `;
  }

  if (currentUser.role === "cliente") {
    return `
      <button
        class="btn primary event-reserve-button reserve-button"
        type="button"
        data-event-id="${event._id}"
      >
        Reservar
      </button>
    `;
  }

  return `
    <p class="event-role-message">
      Las reservas están disponibles para clientes.
    </p>
  `;
};

const createEventCard = (event) => {
  const availableCapacity =
    getAvailableCapacity(event);

  const wineryName =
    event.winery?.name ||
    "Bodega no informada";

  return `
    <article class="event-card">
      <span class="event-card-type">
        ${event.type || "Evento"}
      </span>

      <h3>
        ${event.name}
      </h3>

      <p class="event-card-description">
        ${event.description}
      </p>

      <div class="event-card-details">
        <p>
          <strong>Fecha:</strong>
          ${formatDate(event.date)}
        </p>

        <p>
          <strong>Hora:</strong>
          ${event.time}
        </p>

        <p>
          <strong>Ubicación:</strong>
          ${event.location}
        </p>

        <p>
          <strong>Bodega:</strong>
          ${wineryName}
        </p>

        <p>
          <strong>Lugares disponibles:</strong>
          ${availableCapacity}
        </p>
      </div>

      <p class="price">
        ${formatPrice(event.price)}
        <span>por persona</span>
      </p>

      <div class="event-card-actions">
        ${createEventAction(event)}
      </div>
    </article>
  `;
};

const addReservationButtonEvents = () => {
  const reservationButtons =
    document.querySelectorAll(
      ".reserve-button"
    );

  reservationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const eventId =
        button.dataset.eventId;

      window.location.href =
        `./pages/reservation.html?eventId=${eventId}`;
    });
  });
};

const renderEvents = (events) => {
  eventsContainer.innerHTML = "";

  if (!events || events.length === 0) {
    eventsContainer.innerHTML = `
      <p class="loading">
        No hay eventos disponibles.
      </p>
    `;

    return;
  }

  eventsContainer.innerHTML =
    events
      .map(createEventCard)
      .join("");

  addReservationButtonEvents();
};

const loadEvents = async () => {
  try {
    eventsContainer.innerHTML = `
      <p class="loading">
        Cargando eventos...
      </p>
    `;

    const response = await fetch(
      `${API_URL}/events`
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
        "No se pudieron cargar los eventos"
      );
    }

    renderEvents(result.data);
  } catch (error) {
    eventsContainer.innerHTML = `
      <p class="loading">
        ${error.message}.
        Verificá que el backend esté encendido.
      </p>
    `;
  }
};

const loadUserNavbar = () => {
  const currentUser = getStoredUser();
  const token = getStoredToken();

  if (!currentUser || !token) {
    return;
  }

  if (loginLink) {
    loginLink.remove();
  }

  /*
    Un usuario que ya inició sesión no necesita
    volver a ver el botón Crear cuenta.
  */
  if (registerButton) {
    registerButton.remove();
  }

  const greeting =
    document.createElement("span");

  greeting.classList.add(
    "user-greeting"
  );

  greeting.textContent =
    `Hola, ${currentUser.firstName}`;

  const profileLink =
    document.createElement("a");

  profileLink.href =
    "./pages/profile.html";

  profileLink.textContent =
    "Mi perfil";

  const dashboardLink =
    document.createElement("a");

  dashboardLink.classList.add(
    "nav-btn"
  );

  if (currentUser.role === "cliente") {
    dashboardLink.href =
      "./pages/dashboard-client.html";

    dashboardLink.textContent =
      "Mis reservas";
  } else {
    dashboardLink.href =
      "./pages/dashboard-organizer.html";

    dashboardLink.textContent =
      "Mi panel";
  }

  const logoutButton =
    document.createElement("button");

  logoutButton.classList.add(
    "logout-btn"
  );

  logoutButton.type = "button";

  logoutButton.textContent =
    "Cerrar sesión";

  logoutButton.addEventListener(
    "click",
    () => {
      clearSession();

      window.location.href =
        "./index.html";
    }
  );

  navbar.appendChild(greeting);
  navbar.appendChild(profileLink);
  navbar.appendChild(dashboardLink);
  navbar.appendChild(logoutButton);
};

loadUserNavbar();
loadEvents();