const API_URL = "http://localhost:3000/api";

requireRole("organizador");

const form = document.getElementById("create-winery-form");
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
    ? "Registrando bodega..."
    : "Registrar bodega";
};

const validateWineryData = (wineryData) => {
  if (
    !wineryData.name ||
    !wineryData.location ||
    !wineryData.description
  ) {
    return "Todos los campos son obligatorios";
  }

  if (wineryData.capacity <= 0) {
    return "La capacidad debe ser mayor que cero";
  }

  if (typeof wineryData.available !== "boolean") {
    return "Debés seleccionar el estado de la bodega";
  }

  return null;
};

const createWinery = async (wineryData) => {
  const response = await fetch(`${API_URL}/wineries`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },

    body: JSON.stringify(wineryData)
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "No se pudo registrar la bodega"
    );
  }

  return result;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearMessage();

  const formData = new FormData(form);
  const availableValue = formData.get("available");

  const wineryData = {
    name: formData.get("name").trim(),
    location: formData.get("location").trim(),
    capacity: Number(formData.get("capacity")),
    description: formData.get("description").trim(),
    available:
      availableValue === ""
        ? null
        : availableValue === "true"
  };

  const validationError = validateWineryData(wineryData);

  if (validationError) {
    showMessage(validationError);
    return;
  }

  try {
    setLoading(true);

    await createWinery(wineryData);

    showMessage(
      "Bodega registrada correctamente. Redirigiendo...",
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