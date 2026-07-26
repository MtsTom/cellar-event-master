const bcrypt = require("bcryptjs");

const userRepository =
    require("../repositories/user.repository");

const getUserProfile = async (userId) => {
    const user =
        await userRepository.findUserById(userId);

    if (!user) {
        throw new Error("El usuario no existe");
    }

    return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
    };
};

const updateUserProfile = async (
    userId,
    profileData
) => {
    const user =
        await userRepository.findUserById(userId);

    if (!user) {
        throw new Error("El usuario no existe");
    }

    const firstName =
        profileData.firstName?.trim();

    const lastName =
        profileData.lastName?.trim();

    if (!firstName) {
        throw new Error(
            "El nombre es obligatorio"
        );
    }

    if (!lastName) {
        throw new Error(
            "El apellido es obligatorio"
        );
    }

    const updateData = {
        firstName,
        lastName
    };

    if (profileData.password) {
        if (profileData.password.length < 8) {
            throw new Error(
                "La nueva contraseña debe tener al menos 8 caracteres"
            );
        }

        updateData.password =
            await bcrypt.hash(
                profileData.password,
                10
            );
    }

    const updatedUser =
        await userRepository.updateUserById(
            userId,
            updateData
        );

    if (!updatedUser) {
        throw new Error(
            "No se pudo actualizar el perfil"
        );
    }

    return {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        isEmailVerified:
            updatedUser.isEmailVerified
    };
};

module.exports = {
    getUserProfile,
    updateUserProfile
};