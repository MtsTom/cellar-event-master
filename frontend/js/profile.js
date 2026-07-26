(() => {
    const API_URL = "http://localhost:3000/api";

    let currentUser = null;

    document.addEventListener(
        "DOMContentLoaded",
        initializeProfilePage
    );

    async function initializeProfilePage() {
        const token = getStoredToken();
        const storedUser = getStoredUser();

        if (!token || !storedUser) {
            redirectToLogin();
            return;
        }

        currentUser = storedUser;

        configureDashboardLinks(storedUser.role);
        configurePageEvents();

        await loadProfile();
    }

    function configurePageEvents() {
        const profileForm =
            document.getElementById("profile-form");

        const logoutButton =
            document.getElementById("logout-button");

        const passwordInput =
            document.getElementById("password");

        const confirmPasswordInput =
            document.getElementById(
                "confirm-password"
            );

        if (profileForm) {
            profileForm.addEventListener(
                "submit",
                updateProfile
            );
        }

        if (logoutButton) {
            logoutButton.addEventListener(
                "click",
                logout
            );
        }

        if (passwordInput) {
            passwordInput.addEventListener(
                "input",
                clearMessage
            );
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener(
                "input",
                clearMessage
            );
        }
    }

    async function loadProfile() {
        const token = getStoredToken();

        try {
            const response = await fetch(
                `${API_URL}/users/profile`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const result = await response.json();

            if (response.status === 401) {
                clearStoredSession();
                redirectToLogin();
                return;
            }

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "No se pudo cargar el perfil"
                );
            }

            currentUser = result.data;

            renderProfile(currentUser);
            updateStoredUser(currentUser);
            showProfileForm();
        } catch (error) {
            showLoadingError(error.message);
        }
    }

    function renderProfile(user) {
        setInputValue(
            "first-name",
            user.firstName
        );

        setInputValue(
            "last-name",
            user.lastName
        );

        setInputValue(
            "email",
            user.email
        );

        setInputValue(
            "role",
            formatRole(user.role)
        );

        configureDashboardLinks(user.role);
    }

    async function updateProfile(event) {
        event.preventDefault();

        clearMessage();

        const firstNameInput =
            document.getElementById("first-name");

        const lastNameInput =
            document.getElementById("last-name");

        const passwordInput =
            document.getElementById("password");

        const confirmPasswordInput =
            document.getElementById(
                "confirm-password"
            );

        const saveButton =
            document.getElementById(
                "save-profile-button"
            );

        if (
            !firstNameInput ||
            !lastNameInput ||
            !passwordInput ||
            !confirmPasswordInput ||
            !saveButton
        ) {
            return;
        }

        if (saveButton.disabled) {
            return;
        }

        const firstName =
            firstNameInput.value.trim();

        const lastName =
            lastNameInput.value.trim();

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;

        if (!firstName) {
            showMessage(
                "El nombre es obligatorio.",
                "error"
            );

            firstNameInput.focus();
            return;
        }

        if (!lastName) {
            showMessage(
                "El apellido es obligatorio.",
                "error"
            );

            lastNameInput.focus();
            return;
        }

        if (
            password &&
            password.length < 8
        ) {
            showMessage(
                "La nueva contraseña debe tener al menos 8 caracteres.",
                "error"
            );

            passwordInput.focus();
            return;
        }

        if (
            password !== confirmPassword
        ) {
            showMessage(
                "Las contraseñas no coinciden.",
                "error"
            );

            confirmPasswordInput.focus();
            return;
        }

        if (
            !password &&
            confirmPassword
        ) {
            showMessage(
                "Ingresá primero la nueva contraseña.",
                "error"
            );

            passwordInput.focus();
            return;
        }

        const profileData = {
            firstName,
            lastName
        };

        /*
          La contraseña solo se envía cuando el usuario
          realmente quiere cambiarla.
        */
        if (password) {
            profileData.password = password;
        }

        const token = getStoredToken();

        if (!token) {
            redirectToLogin();
            return;
        }

        try {
            setButtonLoading(saveButton, true);

            const response = await fetch(
                `${API_URL}/users/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },
                    body: JSON.stringify(
                        profileData
                    )
                }
            );

            const result = await response.json();

            if (response.status === 401) {
                clearStoredSession();
                redirectToLogin();
                return;
            }

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "No se pudo actualizar el perfil"
                );
            }

            currentUser = result.data;

            renderProfile(currentUser);
            updateStoredUser(currentUser);

            passwordInput.value = "";
            confirmPasswordInput.value = "";

            showMessage(
                "Perfil actualizado correctamente.",
                "success"
            );
        } catch (error) {
            showMessage(
                error.message,
                "error"
            );
        } finally {
            setButtonLoading(
                saveButton,
                false
            );
        }
    }

    function showProfileForm() {
        const loadingElement =
            document.getElementById(
                "profile-loading"
            );

        const profileForm =
            document.getElementById(
                "profile-form"
            );

        if (loadingElement) {
            loadingElement.hidden = true;
        }

        if (profileForm) {
            profileForm.hidden = false;
        }
    }

    function showLoadingError(message) {
        const loadingElement =
            document.getElementById(
                "profile-loading"
            );

        const profileForm =
            document.getElementById(
                "profile-form"
            );

        if (loadingElement) {
            loadingElement.hidden = false;
            loadingElement.textContent =
                message;
        }

        if (profileForm) {
            profileForm.hidden = true;
        }
    }

    function configureDashboardLinks(role) {
        const dashboardLink =
            document.getElementById(
                "dashboard-link"
            );

        const cancelLink =
            document.getElementById(
                "cancel-link"
            );

        const dashboardUrl =
            getDashboardUrl(role);

        if (dashboardLink) {
            dashboardLink.href =
                dashboardUrl;
        }

        if (cancelLink) {
            cancelLink.href =
                dashboardUrl;
        }
    }

    function getDashboardUrl(role) {
        if (role === "organizador") {
            return "dashboard-organizer.html";
        }

        return "dashboard-client.html";
    }

    function setButtonLoading(
        button,
        isLoading
    ) {
        if (!button) {
            return;
        }

        button.disabled = isLoading;

        button.textContent = isLoading
            ? "Guardando cambios..."
            : "Guardar cambios";
    }

    function showMessage(
        message,
        type
    ) {
        const messageElement =
            document.getElementById(
                "profile-message"
            );

        if (!messageElement) {
            return;
        }

        messageElement.textContent =
            message;

        messageElement.className =
            `form-message ${type}`;

        messageElement.hidden = false;
    }

    function clearMessage() {
        const messageElement =
            document.getElementById(
                "profile-message"
            );

        if (!messageElement) {
            return;
        }

        messageElement.textContent = "";
        messageElement.className =
            "form-message";

        messageElement.hidden = true;
    }

    function setInputValue(
        elementId,
        value
    ) {
        const input =
            document.getElementById(
                elementId
            );

        if (input) {
            input.value =
                value || "";
        }
    }

    function formatRole(role) {
        if (role === "organizador") {
            return "Organizador";
        }

        if (role === "cliente") {
            return "Cliente";
        }

        return role || "Sin rol";
    }

    function getStoredToken() {
        return (
            localStorage.getItem("token") ||
            sessionStorage.getItem("token")
        );
    }

    function getStoredUser() {
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
    }

    function updateStoredUser(user) {
        const userData =
            JSON.stringify(user);

        /*
          Conservamos el mismo tipo de almacenamiento
          utilizado durante el inicio de sesión.
        */
        if (localStorage.getItem("token")) {
            localStorage.setItem(
                "user",
                userData
            );

            return;
        }

        if (sessionStorage.getItem("token")) {
            sessionStorage.setItem(
                "user",
                userData
            );
        }
    }

    function clearStoredSession() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
    }

    function logout() {
        clearStoredSession();

        window.location.href =
            "../index.html";
    }

    function redirectToLogin() {
        window.location.href =
            "login.html";
    }
})();