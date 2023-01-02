import mongoose from "mongoose";
import AuthRoles from "../utils/authRoles";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/index";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Name is required"],
      maxLength: [50, "Name cann't be larger than 50 letters"],
    },
    email: {
      type: String,
      require: [true, "Email is required"],
      validate: {
        validator: validateEmail(email),
        message: "E-mail is invalid",
      },
      unique: true,
    },
    password: {
      type: String,
      require: [true, "Password is required"],
      minLength: [8, "Password must be atleast 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(AuthRoles),
      default: AuthRoles.USER,
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

// Email validation function
function validateEmail(email) {
  let emailRegex =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  return emailRegex.test(email);
}

// Encrypt password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);

  next();
});

// Schema methods
userSchema.methods = {
  comparePassword: async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
  },

  getJwtToken: function () {
    JWT.sign(
      {
        _id: this._id,
        role: this.role,
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRY }
    );
  },

  generateForgotPasswordToken: function () {
    const forgotToken = crypto.randomBytes(20).toString("hex");

    this.forgotPasswordToken = crypto
      .createHash("sha256")
      .update(forgotToken)
      .digest("hex");

    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;
  },
};

export default mongoose.model("User", userSchema);
