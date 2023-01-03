import mongoose from "mongoose";
import app from "./app";
import config from "./config/index";

(async () => {
  try {
    mongoose.connect(config.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

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
