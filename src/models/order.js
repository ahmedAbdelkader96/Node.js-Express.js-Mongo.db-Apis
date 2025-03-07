const mongoose = require("mongoose");

const productOrderSchema = mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: false },
});

const orderSchema = mongoose.Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    products: [productOrderSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("order", orderSchema, "orders");
