const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const globalErrorHandler = require("./Controllers/error.controllers");
const CustomError = require("./Utils/customError.utils");

// Importing routes
const movieRoutes = require("./Routes/movies.routes");
const authRoutes = require("./Routes/auth.routes");
const usersRoutes = require("./Routes/users.routes");

// Initializing the express application
const app = express();

//this add security header in response
app.use(helmet());

// app.use(
//   rateLimit({
//     max: 3,
//     windowMs: 60 * 60 * 1000,
//     message:
//       "We have receive too many request form this IP. Please try after one hour.",
//   })
// );

// Middleware to parse JSON requests
app.use(express.json({ limit: "10kb" }));

//use for data sanitize and use after json() as in
// app.use(sanitize());
// app.use(xss());
app.use(hpp({ whitelist: ["duration"] })); // we can white list property

// and log requests in development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// test route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Express.js application!",
  });
});

app.use("/api/v1/movies", movieRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);

// handling undefined routes
app.all("/{*any}", (req, res, next) => {
  const err = new CustomError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(err);
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
