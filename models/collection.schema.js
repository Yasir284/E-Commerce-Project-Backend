import mongoose from "mongoose";

const collectionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Collection name is require"],
      maxLength: [120, "Collection name must be less than 120 characters"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Collection", collectionSchema);
