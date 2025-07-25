const { customError } = require("../Utils/customError.utils");

const devErrors = (res, error) => {
  res.status(error.statusCode || 500).json({
    status: error.status || "error",
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
  return;
};

const prodErrors = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });
    return;
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong! Please try again later.",
    });
    return;
  }
};

const castErrorHandler = (err) => {
  const message = `Invalid value for ${err.path}: ${err.value}!`;
  return customError(message, 400);
};

const duplicateKeyErrorHandler = (err) => {
  // Extract the key name and value that caused the error
  const key = Object.keys(err.keyValue)[0]; // This will handle any field, not just 'name' or 'email'
  const value = err.keyValue[key];

  // Generalize the message
  const message = `There is already an entry with ${key}: ${value}. Please use a different ${key}.`;

  // Return a custom error
  return customError(message, 400);
};

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV == "development") {
    devErrors(res, err);
  } else {
    if (err.name === "CastError") {
      err = castErrorHandler(err);
    }
    if (err.code === 11000) {
      err = duplicateKeyErrorHandler(err);
    }

    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((el) => el.message)
        .join(". ");
      err = customError(message, 400);
    }

    if (err.name === "TokenExpiredError") {
      err = customError("JWT token has expired. Please log in again!", 401);
    }

    if (err.name === "JsonWebTokenError") {
      err = customError("Invalid token. Please log in again!", 401);
    }

    prodErrors(res, err);
  }
};
