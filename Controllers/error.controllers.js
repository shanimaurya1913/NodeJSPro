const { customError } = require("../Utils/customError.utils");

const devErrors = (res, error) => {
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};

const prodErrors = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong! Please try again later.",
    });
  }
};

const castErrorHandler = (err) => {
  const message = `Invalid value for ${err.path}: ${err.value}!`;
  return customError(message, 400);
};

const duplicateKeyErrorHandler = (err) => {
  const name = err.keyValue.name;
  const message = `There is already a movie with name ${name}. Please use another name!`;
  return customError(message, 400);
};

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    devErrors(req, err);
  } else if (process.env.NODE_ENV === "production") {
    if (err.name === "CastError") {
      err = castErrorHandler(err);
    }
    if (err.code === "11000") {
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

    prodErrors(req, err);
  }
};
