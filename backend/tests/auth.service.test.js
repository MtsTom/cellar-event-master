jest.mock("../src/repositories/user.repository");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userRepository = require("../src/repositories/user.repository");
const authService = require("../src/services/auth.service");

describe("auth.service - loginUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "secreto-de-prueba";
    process.env.JWT_EXPIRES_IN = "1d";
  });

  test("debe iniciar sesión y devolver un token cuando las credenciales son correctas", async () => {
    // Arrange
    const loginData = {
      email: "matias@test.com",
      password: "123456"
    };

    const fakeUser = {
      _id: "user-123",
      firstName: "Matías",
      lastName: "Tomasini",
      email: "matias@test.com",
      password: "hash-guardado",
      role: "cliente",
      isEmailVerified: false
    };

    userRepository.findUserByEmail.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("token-falso");

    // Act
    const result = await authService.loginUser(loginData);

    // Assert
    expect(userRepository.findUserByEmail).toHaveBeenCalledWith(
      "matias@test.com"
    );

    expect(bcrypt.compare).toHaveBeenCalledWith(
      "123456",
      "hash-guardado"
    );

    expect(jwt.sign).toHaveBeenCalledWith(
      {
        id: "user-123",
        email: "matias@test.com",
        role: "cliente"
      },
      "secreto-de-prueba",
      {
        expiresIn: "1d"
      }
    );

    expect(result).toEqual({
      token: "token-falso",
      user: {
        id: "user-123",
        firstName: "Matías",
        lastName: "Tomasini",
        email: "matias@test.com",
        role: "cliente",
        isEmailVerified: false
      }
    });
  });

  test("debe lanzar un error cuando el usuario no existe", async () => {
    userRepository.findUserByEmail.mockResolvedValue(null);

    await expect(
      authService.loginUser({
        email: "inexistente@test.com",
        password: "123456"
      })
    ).rejects.toThrow("Credenciales inválidas");

    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  test("debe lanzar un error cuando la contraseña es incorrecta", async () => {
    userRepository.findUserByEmail.mockResolvedValue({
      _id: "user-123",
      email: "matias@test.com",
      password: "hash-guardado",
      role: "cliente"
    });

    bcrypt.compare.mockResolvedValue(false);

    await expect(
      authService.loginUser({
        email: "matias@test.com",
        password: "incorrecta"
      })
    ).rejects.toThrow("Credenciales inválidas");

    expect(jwt.sign).not.toHaveBeenCalled();
  });
});