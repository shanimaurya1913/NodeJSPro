const User = require("../Models/user.models");
const { asyncErrorHandler } = require("../Utils/asyncErrorHandler.utils");
const { customError } = require("../Utils/customError.utils");

exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!user.comparePassword(req.body.password, user.password)) {
    return next(customError("The current password you provided is wrong", 401));
  }

  user.password = req.user.password;
  user.confirmPassword = req.user.comparePassword;
  await user.save();

  createSendResponse(user, 200, res);
});

const filterReqObj = (obj, ...allowedFields) => {
  const newObj = {};

  allowedFields.forEach((prop) => {
    if (allowedFields.includes(prop)) {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
};
exports.updateMe = asyncErrorHandler(async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (password || confirmPassword) {
    next(customError("You can not update password using this endpoint", 400));
  }

  const filterObj = filterReqObj(req.body, "name", "email");

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filterObj, {
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
