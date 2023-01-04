import User from "../models/user.schema";
import asyncHandler from "../services/asyncHandler";
import CustomeError from "../utils/customeError";

const cookieOptions = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

/**********************************************************************
 @SIGNUP
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

  const isUserExist = await User.find(email);

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
  res.json({
    success: true,
    token,
    user,
  });
});
