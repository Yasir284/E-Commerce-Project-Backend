import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import collectionRoutes from "./routes/collection.routes.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("tiny"));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json("Hello World!");
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/collection", collectionRoutes);
app.use("/api/v1/product", productRoutes);

export default app;
