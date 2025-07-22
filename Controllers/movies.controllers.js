const Movie = require("../Models/movie.models");
const ApiFeature = require("../Utils/apiFeature.utils");
const { asyncErrorHandler } = require("../Utils/asyncErrorHandler.utils");
const { customError } = require("../Utils/customError.utils");

exports.createMovie = asyncErrorHandler(async (req, res, next) => {
  const movie = await Movie.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      movie,
    },
  });
});

exports.getAllMovies = asyncErrorHandler(async (req, res, next) => {
  const features = new ApiFeature(Movie.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const movies = await features.query;
  // const queryObj = JSON.stringify(req.query);
  // const replacedQuery = queryObj.replace(
  //   /\b(gte|gt|lte|lt)\b/g,
  //   (match) => `$${match}`
  // );
  // const parsedQuery = JSON.parse(replacedQuery);

  // let query = Movie.find(parsedQuery);

  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(",").join(" ");
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort("-createdAt");
  // }

  // if (req.query.fields) {
  //   const fields = req.query.fields.split(",").join(" ");
  //   query = query.select(fields);
  // } else {
  //   query = query.select("-__v");
  // }

  // //Pagination
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 10;
  // const skip = (page - 1) * limit;
  // query = query.skip(skip).limit(limit);
  // if (req.query.page) {
  //   const nuOfMovies = await Movie.countDocuments(parsedQuery);
  //   if (skip >= nuOfMovies) {
  //     throw new Error("This page does not exist");
  //   }
  // }

  // const movies = await query;
  res.status(200).json({
    status: "success",
    length: movies.length,
    data: {
      movies,
    },
  });
});

exports.getMovie = asyncErrorHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    const err = customError("No movie found with that ID", 404);
    return next(err);
  }

  res.status(200).json({
    status: "success",
    data: {
      movie,
    },
  });
});

exports.updateMovie = asyncErrorHandler(async (req, res, next) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!movie) {
    const err = customError("No movie found with that ID", 404);
    return next(err);
  }

  res.status(200).json({
    status: "success",
    data: {
      movie,
    },
  });
});

exports.deleteMovie = asyncErrorHandler(async (req, res, next) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);

  if (!movie) {
    const err = customError("No movie found with that ID", 404);
    return next(err);
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getMoviesStats = async (req, res, next) => {
  try {
    const stats = Movie.aggregate([]);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};
