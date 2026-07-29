const API_URL =
    "http://localhost:3000/api";

const organizerName =
    document.getElementById(
        "organizer-name"
    );

const logoutButton =
    document.getElementById(
        "logout-button"
    );

const createEventButton =
    document.getElementById(
        "create-event-button"
    );

const createWineryButton =
    document.getElementById(
        "create-winery-button"
    );

const organizerMessage =
    document.getElementById(
        "organizer-message"
    );

const organizerEventsContainer =
    document.getElementById(
        "organizer-events"
    );

const totalEventsElement =
    document.getElementById(
        "total-events"
    );

const totalReservationsElement =
    document.getElementById(
        "total-reservations"
    );

const totalPeopleElement =
    document.getElementById(
        "total-people"
    );

const totalRevenueElement =
    document.getElementById(
        "total-revenue"
    );

const formatPrice = (value) => {
    return new Intl.NumberFormat(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        }
    ).format(value);
};

const formatDate = (date) => {
    return new Intl.DateTimeFormat(
        "es-AR",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "UTC"
        }
    ).format(new Date(date));
};

const showOrganizerMessage = (
    message
) => {
    organizerMessage.textContent =
        message;

    organizerMessage.style.display =
        "block";
};

const hideOrganizerMessage = () => {
    organizerMessage.style.display =
        "none";
};

const renderOrganizerInformation = () => {
    const currentUser =
        getStoredUser();

    if (!currentUser) {
        return;
    }

    /*
      Mostramos solamente el nombre para evitar
      encabezados demasiado largos.
    */
    organizerName.textContent =
        currentUser.firstName;
};

const updateOrganizerSummary = (
    events
) => {
    const totals = events.reduce(
        (summary, event) => {
            summary.events += 1;

            summary.reservations +=
                Number(
                    event.confirmedReservations
                ) || 0;

            summary.people +=
                Number(
                    event.reservedPeople
                ) || 0;

            summary.revenue +=
                Number(
                    event.revenue
                ) || 0;

            return summary;
        },
        {
            events: 0,
            reservations: 0,
            people: 0,
            revenue: 0
        }
    );

    totalEventsElement.textContent =
        totals.events;

    totalReservationsElement.textContent =
        totals.reservations;

    totalPeopleElement.textContent =
        totals.people;

    totalRevenueElement.textContent =
        formatPrice(totals.revenue);
};

const createEventCard = (event) => {
    const wineryName =
        event.winery?.name ||
        "Bodega no disponible";

    const wineryLocation =
        event.winery?.location ||
        "Ubicación no disponible";

    return `
        <article class="organizer-event-card">
            <div class="organizer-event-card__header">
                <div>
                    <span
                        class="event-status event-status--${event.status}"
                    >
                        ${event.status}
                    </span>

                    <h3>
                        ${event.name}
                    </h3>

                    <p class="organizer-event-type">
                        ${event.type}
                    </p>
                </div>
            </div>

            <p class="organizer-event-description">
                ${event.description}
            </p>

            <div class="organizer-event-details">
                <p>
                    <strong>Fecha:</strong>
                    ${formatDate(event.date)}
                </p>

                <p>
                    <strong>Hora:</strong>
                    ${event.time}
                </p>

                <p>
                    <strong>Lugar:</strong>
                    ${event.location}
                </p>

                <p>
                    <strong>Bodega:</strong>
                    ${wineryName}
                </p>

                <p>
                    <strong>
                        Ubicación de la bodega:
                    </strong>

                    ${wineryLocation}
                </p>

                <p>
                    <strong>
                        Precio por persona:
                    </strong>

                    ${formatPrice(event.price)}
                </p>
            </div>

            <div class="organizer-event-metrics">
                <div>
                    <span>
                        Capacidad
                    </span>

                    <strong>
                        ${event.capacity}
                    </strong>
                </div>

                <div>
                    <span>
                        Lugares disponibles
                    </span>

                    <strong>
                        ${event.availableCapacity}
                    </strong>
                </div>

                <div>
                    <span>
                        Reservas
                    </span>

                    <strong>
                        ${event.confirmedReservations}
                    </strong>
                </div>

                <div>
                    <span>
                        Personas
                    </span>

                    <strong>
                        ${event.reservedPeople}
                    </strong>
                </div>

                <div>
                    <span>
                        Ingresos
                    </span>

                    <strong>
                        ${formatPrice(event.revenue)}
                    </strong>
                </div>
            </div>

            <div class="organizer-event-actions">
                ${event.status === "activo" ? `
                    <button
                        class="secondary-button edit-event-button"
                        type="button"
                        data-event-id="${event._id}"
                    >
                        Editar
                    </button>

                    <button
                        class="danger-button cancel-event-button"
                        type="button"
                        data-event-id="${event._id}"
                    >
                        Cancelar evento
                    </button>
                ` : `
                    <p class="event-role-message">
                        Este evento ya no admite modificaciones.
                    </p>
                `}
            </div>
        </article>
    `;
};

const renderOrganizerEvents = (
    events
) => {
    organizerEventsContainer.innerHTML =
        "";

    if (!events.length) {
        showOrganizerMessage(
            "Todavía no creaste eventos. Podés crear el primero desde este panel."
        );

        updateOrganizerSummary([]);

        return;
    }

    hideOrganizerMessage();

    organizerEventsContainer.innerHTML =
        events
            .map(createEventCard)
            .join("");

    updateOrganizerSummary(events);
    addOrganizerEventActions();
};

const editEvent = (eventId) => {
    window.location.href =
        `create-event.html?eventId=${eventId}`;
};

const cancelEvent = async (eventId, button) => {
    const confirmed = window.confirm(
        "¿Estás seguro de que querés cancelar este evento? El evento dejará de estar disponible para nuevas reservas."
    );

    if (!confirmed) {
        return;
    }

    const token = getStoredToken();
    const originalText = button.textContent;

    try {
        button.disabled = true;
        button.textContent = "Cancelando...";

        const response = await fetch(
            `${API_URL}/events/${eventId}/cancel`,
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
                result.message ||
                "No se pudo cancelar el evento"
            );
        }

        window.alert("Evento cancelado correctamente");
        await loadOrganizerEvents();
    } catch (error) {
        window.alert(error.message);
        button.disabled = false;
        button.textContent = originalText;
    }
};

const addOrganizerEventActions = () => {
    document
        .querySelectorAll(".edit-event-button")
        .forEach((button) => {
            button.addEventListener("click", () => {
                editEvent(button.dataset.eventId);
            });
        });

    document
        .querySelectorAll(".cancel-event-button")
        .forEach((button) => {
            button.addEventListener("click", () => {
                cancelEvent(
                    button.dataset.eventId,
                    button
                );
            });
        });
};

const loadOrganizerEvents = async () => {
    const token = getStoredToken();

    try {
        showOrganizerMessage(
            "Cargando eventos..."
        );

        const response = await fetch(
            `${API_URL}/events/my-events`,
            {
                method: "GET",
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const result =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "No se pudieron obtener los eventos"
            );
        }

        renderOrganizerEvents(
            result.data || []
        );
    } catch (error) {
        organizerEventsContainer.innerHTML =
            "";

        updateOrganizerSummary([]);

        showOrganizerMessage(
            error.message
        );
    }
};

const logout = () => {
    clearSession();

    window.location.href =
        "../index.html";
};

const currentUser =
    requireRole("organizador");

if (currentUser) {
    renderOrganizerInformation();
    loadOrganizerEvents();
}

logoutButton.addEventListener(
    "click",
    logout
);

createEventButton.addEventListener(
    "click",
    () => {
        window.location.href =
            "create-event.html";
    }
);

createWineryButton.addEventListener(
    "click",
    () => {
        window.location.href =
            "create-winery.html";
    }
);