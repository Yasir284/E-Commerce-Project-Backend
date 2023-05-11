import express from "express";
import { addProduct } from "../controllers/product.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/add", isLoggedIn, addProduct);

export default router;
