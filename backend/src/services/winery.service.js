const wineryRepository = require("../repositories/winery.repository");

const createWinery = async (wineryData, user) => {
    if (user.role !== "organizador") {
        throw new Error("Solo los organizadores pueden registrar bodegas");
    }

    return await wineryRepository.createWinery({
        name: wineryData.name,
        location: wineryData.location,
        capacity: wineryData.capacity,
        description: wineryData.description,
        available: wineryData.available,
        organizer: user.id
    });
};

const getWineries = async () => {
    return await wineryRepository.findAllWineries();
};

module.exports = {
    createWinery,
    getWineries
};