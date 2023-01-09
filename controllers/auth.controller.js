import User from "../models/user.schema";
import asyncHandler from "../services/asyncHandler";
import CustomeError from "../utils/customeError";
import mailHelper from "../utils/mailHelper";
import crypto from "crypto";

const cookieOptions = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

/**********************************************************************
 @SIGNUP
 @request_type POST
 @route http://localhost:4000/api/auth/signup
 @description User signup controller for new user
 @parameters name, email, password
 @return User object
 **********************************************************************/

export const signUp = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!(name && email && password)) {
    throw new CustomeError("Please fill all the fields", 400);
  }

  const isUserExist = await User.find({ email });

  if (isUserExist) {
    throw new CustomeError("User alread exists", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = user.getJwtToken();
  user.password = undefined;

  res.cookie("token", token, cookieOptions);
  res.status(200).json({
    success: true,
    token,
    user,
  });
});

/**********************************************************************
 @LOGIN
 @request_type POST
 @route http://localhost:4000/api/auth/login
 @description User login controller
 @parameters email, password
 @return User object
 **********************************************************************/

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    throw new CustomeError("Please fill all the fields", 400);
  }

  const user = await User.find({ email }).select("+password");

  if (!user) {
    throw new CustomeError("Invalid credentials", 400);
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    throw new CustomeError("Invalid credentials", 400);
  }

  const token = user.getJwtToken();
  user.password = undefined;

  res.cookie("token", token, cookieOptions);
  res.status(200).json({
    success: true,
    token,
    user,
  });
});

/**********************************************************************
 @LOGOUT
 @request_type GET
 @route http://localhost:4000/api/auth/logout
 @description User logout by clearing user cookies
 @parameters 
 @return success message
 **********************************************************************/

export const logout = asyncHandler(async (_req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out" });
});

/**********************************************************************
 @FORGOT_PASSWORD
 @request_type POST
 @route http://localhost:4000/api/auth/password/forgot
 @description User will submit email and generate token
 @parameters email
 @return success message - send email
 **********************************************************************/

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new CustomeError("Email is required", 400);

  const user = await User.findOne({ email });

  if (!user) throw new CustomeError("User not found", 400);

  const resetToken = await user.generateForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/password/reset/${resetToken}`;

  const text = `Your password reset url is \n\n ${resetUrl} \n\n`;

  try {
    const options = {
      email: user.email,
      subject: "Password reset email for website",
      text,
    };

    await mailHelper(options);

    res
      .status(200)
      .json({ success: true, message: `Email send to ${user.email}` });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    throw new CustomeError(error.message || "Failed to send Email", 500);
  }
});

/**********************************************************************
 @RESET_PASSWORD
 @request_type POST
 @route http://localhost:4000/api/auth/password/reset/:resetPasswordToken
 @description User will reset password based on Url token
 @parameters token from url, password and confirm password
 @return User object
 **********************************************************************/

export const resetPassword = asyncHandler(async (req, res) => {
  const { token: resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: resetPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new CustomeError("Token is Invalid or Expired", 400);
  }

  if (password !== confirmPassword) {
    throw new CustomeError("Password and Confirm Password must be same", 400);
  }

  user.password = password;
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  await user.save();

  const token = user.getJwtToken();
  user.password = undefined;

  res.cookie("token", token, cookieOptions);
  res.status(200).json({ success: true, user });
});

/**********************************************************************
 @CHANGE_PASSWORD
 @request_type POST
 @route http://localhost:4000/api/auth/password/change
 @description User will change password
 @parameters user from auth middleware, password and confirm password
 @return success message
 **********************************************************************/

export const changePassword = asyncHandler(async (req, res) => {
  const { password, confirmPassword } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId).select("+password");
  console.log(user);

  if (!user) {
    throw new CustomeError("User not found", 400);
  }

  if (password !== confirmPassword) {
    throw new CustomeError("Password and Confirm Password must be same");
  }

  user.password = password;
  user.save();

  res.status(200).json({ success: true, message: "Password changed" });
});

/**********************************************************************
 @GET_PROFILE
 @request_type GET
 @route http://localhost:4000/api/auth/profile
 @description Getting user profile
 @parameters
 @return User object
 **********************************************************************/

export const getProfile = asyncHandler(async (req, res) => {
  const { user } = req;

  if (!user) {
    throw new CustomeError("User not found", 400);
  }

  res.status(200).json({ success: true, user });
});
