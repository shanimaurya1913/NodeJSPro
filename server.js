const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (error) => {
  console.log(error.name, error.message);
  console.log("Uncaught Exception! Shutting down...");
  process.exit(1);
});

const app = require("./app");
// console.log(process.env.CONN_STR);
mongoose
  .connect(process.env.CONN_STR, {
    useNewUrlParser: true,
  })
  .then((conn) => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on("unhandledRejection", (error) => {
  console.log(error.name, error.message);
  console.log("Unhandled Rejection! Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
