const Order = require("../models/order");
const mongoose = require("mongoose");

async function getOrders(req, res, next) {
  try {
    const searchQuery = req.query.q;

    let filter = {};
    if (searchQuery) {
      filter = { title: { $regex: searchQuery, $options: "i" } }; // Case-insensitive search
    }

    const orders = await Order.find(filter).exec();
    console.log(orders);
    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
}

async function getOrder(req, res, next) {
  try {
    const id = req.params.id;

    const order = await Order.findById(id).exec();
    if (order) {
      res.status(200).json(order);
    } else {
      res.status(404).json({ message: "No valid entry found for provided ID" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

async function createOrder(req, res, next) {
  try {
    const { title, description, products } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products are required" });
    }

    const order = new Order({
      _id: new mongoose.Types.ObjectId().toString(),
      title,
      description,
      products,
    });

    const result = await order.save();
    res.status(201).json({
      message: "Created order successfully",
      createdOrder: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
}

async function updateOrder(req, res, next) {
  try {
    const id = req.params.id;
    const { title, description, products } = req.body;

    if (!title && !description && (!products || !Array.isArray(products))) {
      return res.status(400).json({
        message:
          "You must provide at least one param to update (title, description, products)",
      });
    }

    const updateOps = {};
    if (title) updateOps.title = title;
    if (description) updateOps.description = description;
    if (products) updateOps.products = products;

    const result = await Order.findByIdAndUpdate(
      id,
      { $set: updateOps },
      { new: true }
    ).exec();
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "No valid entry found for provided ID" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

async function deleteOrder(req, res, next) {
  try {
    const id = req.params.id;
    const result = await Order.deleteOne({ _id: id }).exec();
    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Order deleted" });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
};
