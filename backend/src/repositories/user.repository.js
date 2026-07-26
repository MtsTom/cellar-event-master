const User = require("../models/user.model");

const createUser = async (userData) => {
    return await User.create(userData);
};

const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};

const findUserById = async (userId) => {
    return await User.findById(userId);
};

const updateUserById = async (
    userId,
    updateData
) => {
    return await User.findByIdAndUpdate(
        userId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserById
};