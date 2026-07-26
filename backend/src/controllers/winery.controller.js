const wineryService = require("../services/winery.service");

const createWinery = async (req, res) => {
    try {
        const winery = await wineryService.createWinery(req.body, req.user);

        res.status(201).json({
            success: true,
            message: "Bodega registrada correctamente",
            data: winery
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getWineries = async (req, res) => {
    try {
        const wineries = await wineryService.getWineries();

        res.status(200).json({
            success: true,
            data: wineries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener bodegas"
        });
    }
};

module.exports = {
    createWinery,
    getWineries
};