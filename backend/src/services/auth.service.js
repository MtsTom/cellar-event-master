const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userRepository = require("../repositories/user.repository");

const registerUser = async (userData) => {
    const existingUser = await userRepository.findUserByEmail(userData.email);

    if (existingUser) {
        throw new Error("El correo electrónico ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await userRepository.createUser({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || "cliente"
    });

    return {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified
    };
};

const loginUser = async (loginData) => {
    const user = await userRepository.findUserByEmail(loginData.email);

    if (!user) {
        throw new Error("Credenciales inválidas");
    }

    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);

    if (!isPasswordValid) {
        throw new Error("Credenciales inválidas");
    }

    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );

    return {
        token,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified
        }
    };
};

module.exports = {
    registerUser,
    loginUser
};