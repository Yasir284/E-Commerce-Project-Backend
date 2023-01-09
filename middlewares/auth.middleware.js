import User from "../models/user.schema";
import config from "../config/index";
import JWT from "jsonwebtoken";
import asyncHandler from "../services/asyncHandler";
import CustomeError from "../utils/customeError";

const isLoggedIn = asyncHandler(async (req, _res, next) => {
  let token;

  const bearerToken = req.header("Authorization")
    ? req.header("Authorization").replace("Bearer ", "")
    : null;

  if (req.cookie.token || bearerToken) {
    token = req.cookie.token || bearerToken;
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
