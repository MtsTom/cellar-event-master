const API_URL = "http://localhost:3000/api";

requireRole("organizador");

const form = document.getElementById("create-event-form");
const winerySelect = document.getElementById("winery");
const formMessage = document.getElementById("form-message");
const submitButton = document.getElementById("submit-button");
const logoutButton = document.getElementById("logout-button");

const token = getStoredToken();

const showMessage = (message, type = "error") => {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
};

const clearMessage = () => {
  formMessage.textContent = "";
  formMessage.className = "form-message";
};

const setLoading = (isLoading) => {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading
    ? "Creando evento..."
    : "Crear evento";
};

const loadWineries = async () => {
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

const createEvent = async (eventData) => {
  const response = await fetch(`${API_URL}/events`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },

    body: JSON.stringify(eventData)
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "No se pudo crear el evento"
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

    await createEvent(eventData);

    showMessage(
      "Evento creado correctamente. Redirigiendo...",
      "success"
    );

    form.reset();

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

loadWineries();