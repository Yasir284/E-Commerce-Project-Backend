import express from "express";
import {
  createCollection,
  getCollections,
  deleteCollection,
  updateCollection,
} from "../controllers/collection.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/create", isLoggedIn, createCollection);
router.get("/get", isLoggedIn, getCollections);
router.delete("/delete", isLoggedIn, deleteCollection);
router.put("/update", isLoggedIn, updateCollection);

export default router;
