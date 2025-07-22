const { Router } = require("express");
const usersController = require("./../Controllers/users.controllers");
const authCOntroller = require("./../Controllers/auth.controllers");

const router = Router();

router
  .route("/updatePassword")
  .patch(authCOntroller.protect, usersController.updatePassword);

router
  .route("/updateMe")
  .patch(authCOntroller.protect, usersController.updateMe);

router
  .route("/deleteMe")
  .delete(authCOntroller.protect, usersController.deleteMe);

module.exports = router;
