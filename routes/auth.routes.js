import express from "express";
import {
  signUp,
  logIn,
  logOut,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
} from "../controllers/auth.controller.js";
import isLoggedIn from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", logIn);
router.get("/logout", isLoggedIn, logOut);
router.put("/password/forgot", forgotPassword);
router.put("/password/reset/:resetToken", resetPassword);
router.put("/password/change", isLoggedIn, changePassword);
router.get("/profile", isLoggedIn, getProfile);

export default router;
