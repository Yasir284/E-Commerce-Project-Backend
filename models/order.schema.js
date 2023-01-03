import mongoose from "mongoose";
import OrderStatus from "../utils/orderStatus";

const orderSchema = mongoose.Schema(
  {
    products: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          count: Number,
          price: Number,
        },
      ],
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    address: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: Number,
      required: true,
    },

    coupon: String,

    transitionId: String,

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.ORDERED,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
