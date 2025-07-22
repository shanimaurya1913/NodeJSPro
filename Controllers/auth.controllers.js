const { asyncErrorHandler } = require("../Utils/asyncErrorHandler.utils");
const User = require("./../Models/user.models");
const jwt = require("jsonwebtoken");
const { customError } = require("../Utils/customError.utils");
const util = require("util");
const crypto = require("crypto");
const { sendEmail } = require("../Utils/email.utils");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

exports.createSendResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  const options = {
    maxAge: process.env.LOGIN_EXPIRES,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  user.password = undefined;

  res.cookies("jwt", token, options);

  res.status(statusCode).json({
    status: "success",
    data: {
      user,
    },
    token,
  });
};

exports.signup = asyncErrorHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  createSendResponse(user, 201, res);
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(customError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(customError("Incorrect email or password", 401));
  }

  createSendResponse(user, 200, res);
});

exports.protect = asyncErrorHandler(async (req, res, next) => {
  // Check if token is provided
  let token;

  const testToken = req.headers.authorization;

  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }

  // If no token is provided, return an error
  if (!token) {
    return next(customError("You are not logged in", 401));
  }

  // Verify the token
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // Check if user exists
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return next(
      customError("The user belonging to this token does not exist", 401)
    );
  }

  // Check if user changed password after the token was issued

  if (await user.isPasswordChangedAfter(decodedToken.iat)) {
    return next(
      customError("User recently changed password! Please log in again", 401)
    );
  }

  // user is authenticated, attach user to request object
  req.user = user;

  // Proceed to the next middleware
  next();
});

exports.restrict = (...roles) => {
  return asyncErrorHandler(async (req, res, next) => {
    //check role have permission
    if (roles.includes(req.user.role)) {
      return next(
        customError(
          "You don not have permission to perform this operation",
          403
        )
      );
    }
  });
};

exports.forgetPassword = asyncErrorHandler(async (req, res, next) => {
  //get user based on email
  const user = User.findOne({ email: req.body.email });

  if (!user) {
    next(customError("User not found with given email", 404));
  }

  //generate random toke
  const token = user.createResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //send email to this token
  const url = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/resetPassword/${token}`;
  const message = `We have receive a password reset request. Please use the below link to reset your password.\n\n${url}\n\n This will valid for 10 minute `;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password change request receive",
      message: message,
    });

    res.status(200).json({
      status: "success",
      message: "password reset like send to the user email successful",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    next(
      customError(
        "There was an error sending password rest email.Please try again later",
        500
      )
    );
  }
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  const token = req.params.token;
  const resetToken = crypto.createHash(32).update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    next(customError("Token is invalid or expired!", 400));
  }

  // resting password
  (user.password = req.body.password),
    (user.confirmPassword = req.body.comparePassword);
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpire = undefined;
  user.passwordChangedAt = Date.now();

  await user.save();

  createSendResponse(user, 200, res);
});
