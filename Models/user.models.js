const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [5, "Email must be at least 5 characters long"],
    maxlength: [50, "Email must be at most 50 characters long"],
    // validate: {
    //   validator: function (v) {
    //     return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
    //   },
    //   message: (props) => `${props.value} is not a valid email!`,
    // },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    select: false,
  },
  confirmPassword: {
    type: String,
    select: false,
    required: [true, "Confirm Password is required"],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: "Password & confirm password does not match",
    },
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  photo: String,
  passwordChangedAt: Date,

  passwordResetToken: String,

  passwordResetTokenExpire: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Hash the password before saving it to the database
  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined; // Remove confirmPassword field before saving
  next();
});

userSchema.methods.comparePassword = async function (pass, passDB) {
  return await bcrypt.compare(pass, passDB);
};

userSchema.methods.isPasswordChangedAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimestamp;
  }
  return false; // If passwordChangedAt is not set, return false
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

module.exports = mongoose.model("User", userSchema);
