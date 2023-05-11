import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      maxLength: [100, "Name must be less than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      maxLength: [6, "Price must be less than 6 digits"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    rating: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
    images: [
      {
        secure_url: { type: String, required: true },
      },
    ],
    reviews: [
      {
        name: { type: String, required: [true, "User name is required"] },
        rating: { type: Number, required: [true, "Rating is required"] },
        comment: { type: Number, required: [true, "Comment is required"] },
        createdAt: { type: Date, default: Date.now() },
        updatedAt: { type: Date, default: Date.now() },
      },
    ],
    stocks: {
      type: Number,
      maxLength: [4, "Stocks must be less than 4 digits"],
      default: 0,
    },
    sold: {
      type: Number,
      defauld: 0,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
