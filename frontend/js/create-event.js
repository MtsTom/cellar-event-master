const API_URL = "http://localhost:3000/api";

requireRole("organizador");

const form = document.getElementById("create-event-form");
const winerySelect = document.getElementById("winery");
const formMessage = document.getElementById("form-message");
const submitButton = document.getElementById("submit-button");
const logoutButton = document.getElementById("logout-button");
const formTitle = document.getElementById("form-title");
const formDescription = document.getElementById("form-description");

const token = getStoredToken();
const params = new URLSearchParams(window.location.search);
const eventId = params.get("eventId");
const isEditMode = Boolean(eventId);

const showMessage = (message, type = "error") => {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
};

const clearMessage = () => {
  formMessage.textContent = "";
  formMessage.className = "form-message";
};

const setPageMode = () => {
  if (!isEditMode) {
    return;
  }

  document.title = "Editar evento | Cellar Event Master";
  formTitle.textContent = "Editar evento";
  formDescription.textContent =
    "Modificá los datos del evento y guardá los cambios.";
  submitButton.textContent = "Guardar cambios";
};

const setLoading = (isLoading) => {
  submitButton.disabled = isLoading;

  if (isLoading) {
    submitButton.textContent = isEditMode
      ? "Guardando cambios..."
      : "Creando evento...";
    return;
  }

  submitButton.textContent = isEditMode
    ? "Guardar cambios"
    : "Crear evento";
};

const loadWineries = async (selectedWineryId = "") => {
  try {
    winerySelect.disabled = true;

    const response = await fetch(`${API_URL}/wineries`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "No se pudieron cargar las bodegas"
      );
    }

    winerySelect.innerHTML = `
      <option value="">
        Seleccionar bodega
      </option>
    `;

    if (!result.data || result.data.length === 0) {
      winerySelect.innerHTML = `
        <option value="">
          No hay bodegas disponibles
        </option>
      `;

      showMessage(
        "No hay bodegas registradas. Primero debés registrar una bodega."
      );

      return;
    }

    result.data.forEach((winery) => {
      const option = document.createElement("option");

      option.value = winery._id;
      option.textContent = `${winery.name} - ${winery.location}`;
      option.selected = winery._id === selectedWineryId;

      winerySelect.appendChild(option);
    });
  } catch (error) {
    winerySelect.innerHTML = `
      <option value="">
        Error al cargar bodegas
      </option>
    `;

    showMessage(error.message);
  } finally {
    winerySelect.disabled = false;
  }
};

const formatDateForInput = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

const loadEventForEditing = async () => {
  try {
    showMessage("Cargando datos del evento...", "success");
    setLoading(true);

    const response = await fetch(`${API_URL}/events/${eventId}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "No se pudo cargar el evento"
      );
    }

    const event = result.data;

    if (event.status !== "activo") {
      throw new Error("Solo se pueden editar eventos activos");
    }

    form.elements.name.value = event.name;
    form.elements.description.value = event.description;
    form.elements.date.value = formatDateForInput(event.date);
    form.elements.time.value = event.time;
    form.elements.location.value = event.location;
    form.elements.capacity.value = event.capacity;
    form.elements.price.value = event.price;
    form.elements.type.value = event.type;

    const wineryId = event.winery?._id || event.winery;
    await loadWineries(wineryId);

    clearMessage();
  } catch (error) {
    showMessage(error.message);
    form.querySelectorAll("input, textarea, select, button[type='submit']")
      .forEach((element) => {
        element.disabled = true;
      });
  } finally {
    setLoading(false);
  }
};

const validateFormData = (eventData) => {
  if (
    !eventData.name ||
    !eventData.description ||
    !eventData.date ||
    !eventData.time ||
    !eventData.location ||
    !eventData.type ||
    !eventData.winery
  ) {
    return "Todos los campos son obligatorios";
  }

  if (eventData.capacity <= 0) {
    return "La capacidad debe ser mayor que cero";
  }

  if (eventData.price < 0) {
    return "El precio no puede ser negativo";
  }

  const selectedDate = new Date(
    `${eventData.date}T${eventData.time}`
  );

  const currentDate = new Date();

  if (selectedDate <= currentDate) {
    return "La fecha y hora del evento deben ser futuras";
  }

  return null;
};

const saveEvent = async (eventData) => {
  const url = isEditMode
    ? `${API_URL}/events/${eventId}`
    : `${API_URL}/events`;

  const method = isEditMode ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(eventData)
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
      (isEditMode
        ? "No se pudo actualizar el evento"
        : "No se pudo crear el evento")
    );
  }

  return result;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearMessage();

  const formData = new FormData(form);

  const eventData = {
    name: formData.get("name").trim(),
    description: formData.get("description").trim(),
    date: formData.get("date"),
    time: formData.get("time"),
    location: formData.get("location").trim(),
    capacity: Number(formData.get("capacity")),
    price: Number(formData.get("price")),
    type: formData.get("type"),
    winery: formData.get("winery")
  };

  const validationError = validateFormData(eventData);

  if (validationError) {
    showMessage(validationError);
    return;
  }

  try {
    setLoading(true);

    await saveEvent(eventData);

    showMessage(
      isEditMode
        ? "Evento actualizado correctamente. Redirigiendo..."
        : "Evento creado correctamente. Redirigiendo...",
      "success"
    );

    setTimeout(() => {
      window.location.href = "dashboard-organizer.html";
    }, 1200);
  } catch (error) {
    showMessage(error.message);
  } finally {
    setLoading(false);
  }
});

logoutButton.addEventListener("click", () => {
  clearSession();
  window.location.href = "login.html";
});

setPageMode();

if (isEditMode) {
  loadEventForEditing();
} else {
  loadWineries();
}
