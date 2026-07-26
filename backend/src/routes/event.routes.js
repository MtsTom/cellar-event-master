const express = require("express");

const eventController =
    require("../controllers/event.controller");

const { protect } =
    require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
    "/",
    eventController.getEvents
);

router.get(
    "/my-events",
    protect,
    eventController.getOrganizerEvents
);

router.get(
    "/:id",
    eventController.getEventById
);

router.post(
    "/",
    protect,
    eventController.createEvent
);

module.exports = router;