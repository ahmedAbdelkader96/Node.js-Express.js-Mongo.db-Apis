const Product = require("../models/product");
const mongoose = require("mongoose");

async function getProducts(req, res, next) {
  try {
    const searchQuery = req.query.q;

    let filter = {};
    if (searchQuery) {
      filter = { name: { $regex: searchQuery, $options: "i" } }; // Case-insensitive search
    }

    const products = await Product.find(filter).exec();
    console.log(products);
    res.status(200).json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
}

async function getProduct(req, res, next) {
  try {
    const id = req.params.id;

    const product = await Product.findById(id).exec();
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "No valid entry found for provided ID" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, price, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!price) {
      return res.status(400).json({ message: "Price is required" });
    }
    if (!imageUrl) {
      return res.status(400).json({ message: "ImageUrl is required" });
    }

    const product = new Product({
      _id: new mongoose.Types.ObjectId(),
      name,
      price,
      imageUrl,
    });

    const result = await product.save();
    res.status(201).json({
      message: "Created product successfully",
      createdProduct: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
}

async function updateProduct(req, res, next) {
  try {
    const id = req.params.id;
    const { name, price, imageUrl } = req.body;

    if (!name && !price && !imageUrl) {
      return res.status(400).json({
        message:
          "You must provide at least one param to update (name, price, imageUrl)",
      });
    }

    const updateOps = {};
    if (name) updateOps.name = name;
    if (price) updateOps.price = price;
    if (imageUrl) updateOps.imageUrl = imageUrl;

    const result = await Product.findByIdAndUpdate(
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

async function deleteProduct(req, res, next) {
  try {
    const id = req.params.id;
    const result = await Product.deleteOne({ _id: id }).exec();
    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Product deleted" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
