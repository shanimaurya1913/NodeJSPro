const { Router } = require("express");
const authController = require("../Controllers/auth.controllers");

const router = Router();

router.route("/signup").post(authController.signup);

router.route("/login").post(authController.login);

router.route("/forgetPassword").post(authController.forgetPassword);

router.route("/resetPassword/:token").patch(authController.resetPassword);

module.exports = router;
