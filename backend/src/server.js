require("dotenv").config();

const app = require("./app");

const connectDB = require("./config/database");

const PORT = process.env.PORT || 3000;

const startServer = async () => {

    await connectDB();

    app.listen(PORT, () => {

        console.log("==================================");

        console.log("🚀 Cellar Event Master iniciado");

        console.log(`📍 Puerto: ${PORT}`);

        console.log("==================================");

    });

};

startServer();