const { Router } = require("express");
const {
  getAllMovies,
  createMovie,
  getMovie,
  updateMovie,
  deleteMovie,
} = require("../Controllers/movies.controllers");

const router = Router();

router.post("/", createMovie);

router.get("/", getAllMovies);

router.get("/:id", getMovie);

router.patch("/:id", updateMovie);

router.delete("/:id", deleteMovie);

module.exports = router;
