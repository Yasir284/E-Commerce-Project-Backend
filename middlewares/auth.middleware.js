import User from "../models/user.schema.js";
import config from "../config/index.js";
import JWT from "jsonwebtoken";
import asyncHandler from "../services/asyncHandler.js";
import CustomeError from "../utils/customError.js";

const isLoggedIn = asyncHandler(async (req, _res, next) => {
  let token;

  const bearerToken = req.header("Authorization")
    ? req.header("Authorization").replace("Bearer ", "")
    : null;

  console.log(req.cookies);

  if (req.cookies.token || bearerToken) {
    token = req.cookies.token || bearerToken;
  }

  if (!token) {
    throw new CustomeError("Not authorized to access the route");
  }

  try {
    const decodeToken = JWT.verify(token, config.JWT_SECRET);
    console.log(decodeToken);
    req.user = await User.findById(decodeToken._id, "name email role");

    next();
  } catch (error) {
    throw new CustomeError("Not authorized to access the route", 400);
  }
});

export default isLoggedIn;
