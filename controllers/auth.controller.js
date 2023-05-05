import User from "../models/user.schema.js";
import asyncHandler from "../services/asyncHandler.js";
import CustomError from "../utils/customError.js";
import mailHelper from "../utils/mailHelper.js";
import crypto from "crypto";

// Setting cookies options
const cookiesOptions = {
  httpOnly: true,
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
};

/**********************************************************************
 @SIGNUP
 @request_type POST
 @route http://localhost:4000/api/v1/auth/signup
 @description User signup controller for new user
 @parameters name, email, password
 @return User object
 **********************************************************************/

export const signUp = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if all field are there
  if (!(name && email && password))
    throw new CustomError("Please fill all the fields", 400);

  // Check if user already exists
  const isUserExists = await User.findOne({ email });

  if (isUserExists) throw new CustomError("User already exists", 400);

  const user = await User.create({ name, email, password });

  //   Creating a token
  const token = user.getJwtToken();
  user.password = undefined;

  // Sending response
  res.cookie("token", token, cookiesOptions);
  res.status(200).json({
    success: true,
    user,
    token,
  });
});

/**********************************************************************
 @LOGIN
 @request_type POST
 @route http://localhost:4000/api/v1/auth/login
 @description Login controller for existing user
 @parameters email, password
 @return User object
 **********************************************************************/
export const logIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if all field are there
  if (!(email && password))
    throw new CustomError("Please fill all the fields", 400);

  // Check if user already exists
  const user = await User.findOne({ email }).select("+password");
  console.log(user);
  if (!user) throw new CustomError("Invalid credentials", 400);

  // Validate password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) throw new CustomError("Invalid credentials", 400);

  //   Creating a token
  const token = user.getJwtToken();
  user.password = undefined;

  // Sending response
  res.cookie("token", token, cookiesOptions);
  res.status(200).json({
    success: true,
    user,
    token,
  });
});

/**********************************************************************
 @LOGOUT
 @request_type GET
 @route http://localhost:4000/api/v1/auth/logout
 @description Logging out user by clearing cookie
 @parameters 
 @return Success message
 **********************************************************************/

export const logOut = asyncHandler(async (_req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

/**********************************************************************
 @FORGOT_PASSWORD
 @request_type PUT
 @route http://localhost:4000/api/v1/auth/password/forgot
 @description  Getting email from user and sending reset passowrd url to the user through email 
 @parameters eamil
 @return Success message
 **********************************************************************/

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new CustomError("Email is required", 400);

  // Validate email
  const user = await User.findOne({ email });
  console.log(user);

  if (!user) throw new CustomError("Invalid credentials", 400);

  // Create forgot password token
  const resetToken = await user.generateForgotPasswordToken();
  console.log(resetToken);

  await user.save({ validateBeforeSave: false });

  // Create url to be sent
  const url = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/password/reset/${resetToken}`;

  // Send mail
  try {
    const options = {
      email: user.email,
      subject: "Password reset email for website",
      text: `Your reset passwrod url is ${url}`,
    };

    await mailHelper(options);

    res
      .status(200)
      .json({ success: true, message: `Email sent to ${user.email}` });
  } catch (err) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    user.save({ validateBeforeSave: true });

    throw new CustomError(err.message || "Error in sending email", 500);
  }
});

/**********************************************************************
 @RESET_PASSWORD
 @request_type PUT
 @route http://localhost:4000/api/v1/auth/password/reset/:resetToken
 @description Reset password based on the token given in the url
 @parameters resetPasswordToken, password and confirmPassowrd 
 @return User object
 **********************************************************************/

export const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // find user based on resetPasswordToken
  const user = await User.findOne({
    forgotPasswordToken: resetPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) throw new CustomError("Token is Invalid or Expired", 400);

  // Check if password and confirmPassword is same
  if (password != confirmPassword)
    throw new CustomError("Password and Confirm Password does not match", 400);

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  const token = user.getJwtToken();
  user.password = undefined;

  res.cookie("token", token, cookiesOptions);

  res.status(200).json({
    success: true,
    message: "Your password has been reset",
    token,
    user,
  });
});

/**********************************************************************
 @CHANGE_PASSWORD
 @request_type PUT
 @route http://localhost:4000/api/v1/auth/password/change
 @description Validate user and change the password
 @parameters user id, password and confirmPassowrd 
 @return Success message
 **********************************************************************/

export const changePassword = asyncHandler(async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { _id: userId } = req.user;

  if (!(password && confirmPassword))
    throw new CustomError("All field are mandatory", 400);

  // find user based on resetPasswordToken
  const user = await User.findById({
    _id: userId,
  });

  if (!user) throw new CustomError("User not found", 400);

  // Check if password and confirmPassword is same
  if (password != confirmPassword)
    throw new CustomError("Password and Confirm Password does not match", 400);

  user.password = password;

  await user.save();
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: "Your password has been changed",
  });
});

/**********************************************************************
 @GET_PROFILE
 @request_type GET
 @route http://localhost:4000/api/v1/auth/profile
 @description Validate user and change the password
 @parameters 
 @return User object
 **********************************************************************/

export const getProfile = asyncHandler(async (req, res) => {
  const { user } = req;

  if (!user) throw new CustomError("User not found", 400);

  res.status(200).json({ success: true, user });
});
