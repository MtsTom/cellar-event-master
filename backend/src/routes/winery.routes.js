const express = require("express");
const wineryController = require("../controllers/winery.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", wineryController.getWineries);
router.post("/", protect, wineryController.createWinery);

module.exports = router;