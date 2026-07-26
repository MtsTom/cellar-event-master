const API_URL = "http://localhost:3000/api";

const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const role = document.getElementById("role").value;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !confirmPassword ||
    !role
  ) {
    registerMessage.textContent = "Todos los campos son obligatorios.";
    registerMessage.className = "form-message error";
    return;
  }

  if (password !== confirmPassword) {
    registerMessage.textContent = "Las contraseñas no coinciden.";
    registerMessage.className = "form-message error";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        role
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    registerMessage.textContent =
      "Usuario registrado correctamente. Redirigiendo...";
    registerMessage.className = "form-message success";

    registerForm.reset();

    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1500);

  } catch (error) {
    registerMessage.textContent =
      error.message || "Error al registrar el usuario.";
    registerMessage.className = "form-message error";
  }
});