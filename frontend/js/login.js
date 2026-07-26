const API_URL = "http://localhost:3000/api";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    localStorage.setItem("token", result.data.token);
    localStorage.setItem("user", JSON.stringify(result.data.user));

    loginMessage.textContent = "Inicio de sesión exitoso. Redirigiendo...";
    loginMessage.className = "form-message success";

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1200);

  } catch (error) {
    loginMessage.textContent = error.message || "Error al iniciar sesión";
    loginMessage.className = "form-message error";
  }
});