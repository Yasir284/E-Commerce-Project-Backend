import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    default: null,
  },
  rating: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      maxLength: [120, "Product name must be less than 120 characters"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Product Price is required"],
      maxLength: [5, "Product price must be less than 5 digits"],
    },

    description: {
      type: String,
    },

    stokes: {
      type: Number,
      default: 0,
    },

    photos: [
      {
        secure_url: {
          type: String,
          required: true,
        },
      },
    ],

    review: [reviewSchema],

    avgAating: {
      type: Number,
      required: true,
      default: 0,
    },

    totalReviews: {
      type: Number,
      required: true,
      default: 0,
    },

    sold: {
      type: Number,
      default: 0,
    },

    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
