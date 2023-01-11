import app from "./app.js";
import mongoose from "mongoose";
import config from "./config/index.js";

(async () => {
  try {
    mongoose.set("strictQuery", false);

    mongoose.connect(config.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB CONNECTED");

    app.on("error", (err) => {
      console.log("ERROR: ", err);
      throw err;
    });

    app.listen(config.PORT, () => console.log(`Listening on ${config.PORT}`));
  } catch (err) {
    console.log("ERROR ", err);
    throw err;
  }
})();
