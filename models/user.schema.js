import mongoose from "mongoose";
import AuthRoles from "../utils/authRoles";

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
    forgetPasswordToken: String,
    forgetPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

function validateEmail(email) {
  let emailRegex =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  return emailRegex.test(email);
}

export default mongoose.model("User", userSchema);
