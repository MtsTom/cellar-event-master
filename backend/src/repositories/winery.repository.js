const Winery = require("../models/winery.model");

const createWinery = async (wineryData) => {
    return await Winery.create(wineryData);
};

const findAllWineries = async () => {
    return await Winery.find().populate("organizer", "firstName lastName email role");
};

module.exports = {
    createWinery,
    findAllWineries
};