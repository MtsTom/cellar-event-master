const express = require("express");
const cors = require("cors");

const wineryRoutes =
    require("./routes/winery.routes");

const authRoutes =
    require("./routes/auth.routes");

const eventRoutes =
    require("./routes/event.routes");

const reservationRoutes =
    require("./routes/reservation.routes");

const userRoutes =
    require("./routes/user.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message:
            "Bienvenido a la API de Cellar Event Master 🍷",
        version: "1.0.0"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/wineries", wineryRoutes);
app.use("/api/events", eventRoutes);
app.use(
    "/api/reservations",
    reservationRoutes
);
app.use("/api/users", userRoutes);

module.exports = app;