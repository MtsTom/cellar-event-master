const express = require("express");
const reservationController = require("../controllers/reservation.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", protect, reservationController.createReservation);
router.get("/my-reservations", protect, reservationController.getMyReservations);
router.patch("/:id/cancel", protect, reservationController.cancelReservation);

module.exports = router;