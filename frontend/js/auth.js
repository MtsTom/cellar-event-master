const getStoredUser = () => {
  const userData = localStorage.getItem("user");

  if (!userData) {
    return null;
  }

  try {
    return JSON.parse(userData);
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
};

const getStoredToken = () => {
  return localStorage.getItem("token");
};

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const requireAuthentication = () => {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    clearSession();
    window.location.href = "./login.html";
    return null;
  }

  return user;
};

const requireRole = (allowedRole) => {
  const user = requireAuthentication();

  if (!user) {
    return null;
  }

  if (user.role !== allowedRole) {
    window.location.href = "../index.html";
    return null;
  }

  return user;
};