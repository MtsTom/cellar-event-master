const API_URL = "http://localhost:3000/api";

const currentUser = requireRole("cliente");
const reservationsContainer = document.getElementById("reservationsContainer");
const welcomeTitle = document.getElementById("welcomeTitle");
const logoutButton = document.getElementById("logoutButton");

if (currentUser) {
  welcomeTitle.textContent = `Bienvenido, ${currentUser.firstName}`;
}

logoutButton.addEventListener("click", () => {
  clearSession();
  window.location.href = "../index.html";
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS"
  }).format(price);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("es-AR");
};

const showSuccessMessage = (message) => {
  const notification = document.createElement("div");

  notification.className = "success-toast";
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");

    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 2500);
};

const cancelReservation = async (reservationId) => {
  const confirmed = window.confirm(
    "¿Estás seguro de que querés cancelar esta reserva?"
  );

  if (!confirmed) {
    return;
  }

  const token = getStoredToken();

  try {
    const response = await fetch(
      `${API_URL}/reservations/${reservationId}/cancel`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "No se pudo cancelar la reserva"
      );
    }

    await loadReservations();

    showSuccessMessage("Reserva cancelada correctamente.");
  } catch (error) {
    alert(error.message);
  }
};

const addCancelButtonListeners = () => {
  const cancelButtons = document.querySelectorAll(
    ".cancel-reservation-btn"
  );

  cancelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const reservationId = button.dataset.reservationId;

      cancelReservation(reservationId);
    });
  });
};

const renderReservations = (reservations) => {
  const validReservations = reservations.filter(
    (reservation) => reservation.event !== null
  );

  if (!validReservations.length) {
    reservationsContainer.innerHTML = `
      <div class="empty-state">
        <h3>Todavía no tenés reservas</h3>
        <p>
          Explorá los eventos disponibles y realizá tu primera reserva.
        </p>
        <a href="../index.html#events" class="btn primary">
          Ver eventos
        </a>
      </div>
    `;

    return;
  }

  reservationsContainer.innerHTML = validReservations
    .map((reservation) => {
      const event = reservation.event;

      return `
        <article class="reservation-card">
          <div class="reservation-card-header">
            <span class="reservation-status ${reservation.status}">
              ${reservation.status}
            </span>

            <span class="reservation-date">
              Reservado el ${formatDate(reservation.reservationDate)}
            </span>
          </div>

          <h3>${event.name}</h3>

          <p>
            <strong>Fecha:</strong>
            ${formatDate(event.date)}
            ${event.time ? `· ${event.time}` : ""}
          </p>

          <p>
            <strong>Ubicación:</strong>
            ${event.location}
          </p>

          <p>
            <strong>Personas:</strong>
            ${reservation.peopleQuantity}
          </p>

          <p class="reservation-price">
            ${formatPrice(reservation.totalPrice)}
          </p>

          ${
            reservation.status !== "cancelada"
              ? `
                <button
                  class="cancel-reservation-btn"
                  data-reservation-id="${reservation._id}"
                >
                  Cancelar reserva
                </button>
              `
              : ""
          }
        </article>
      `;
    })
    .join("");

  addCancelButtonListeners();
};

const loadReservations = async () => {
  const token = getStoredToken();

  try {
    const response = await fetch(
      `${API_URL}/reservations/my-reservations`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "No se pudieron cargar las reservas"
      );
    }

    renderReservations(result.data);
  } catch (error) {
    reservationsContainer.innerHTML = `
      <div class="empty-state">
        <h3>No pudimos cargar tus reservas</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
};

loadReservations();