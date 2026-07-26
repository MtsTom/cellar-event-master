const userService = require("../services/user.service");

const getProfile = async (req, res) => {
    try {
        const user = await userService.getUserProfile(
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Perfil obtenido correctamente",
            data: user
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const updatedUser =
            await userService.updateUserProfile(
                req.user.id,
                req.body
            );

        res.status(200).json({
            success: true,
            message: "Perfil actualizado correctamente",
            data: updatedUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile
};