const User = require("../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const constants = require("../configs/constants");

const emailRegex = constants.emailRegex;
const passwordRegex = constants.passwordRegex;

async function getUsers(req, res, next) {
  try {
    const searchQuery = req.query.q;

    let filter = {};
    if (searchQuery) {
      filter = { name: { $regex: searchQuery, $options: "i" } }; // Case-insensitive search
    }

    const users = await User.find(filter).select("-password").exec();
    console.log(users);
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
}

async function getUser(req, res, next) {
  try {
    const id = req.params.id;

    const user = await User.findById(id).select("-password").exec();
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "No valid entry found for provided ID" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

async function signUp(req, res, next) {
  try {
    const { name, email, password, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least 6 numbers and 3 letters",
      });
    }

    const existingUser = await User.findOne({ email: email }).exec();
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const id = new mongoose.Types.ObjectId();

    const user = new User({
      _id: id,
      email: email,
      password: hash,
      name: name,
      imageUrl: imageUrl,
    });

    const result = await user.save();

    const userObject = result.toObject();
    delete userObject.password;

    const token = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User Created successfully",
      user: userObject,
      token: token,
      refreshToken: refreshToken,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

async function logIn(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least 6 numbers and 3 letters",
      });
    }

    const user = await User.findOne({ email: email }).exec();
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account is linked to this email" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Password is incorrect!" });
    }

    const userObject = user.toObject();
    delete userObject.password;

    const token = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Auth successful",
      user: userObject,
      token: token,
      refreshToken: refreshToken,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

async function renewToken(req, res, next) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);

    const newToken = jwt.sign(
      { email: decoded.email, userId: decoded.userId },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    const newRefreshToken = jwt.sign(
      { email: decoded.email, userId: decoded.userId },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Token renewed",
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

async function updateUser(req, res, next) {
  try {
    const id = req.params.id;
    const { name, imageUrl } = req.body;

    if (!name && !imageUrl) {
      return res.status(400).json({
        message:
          "You must provide at least one param to update (name, imageUrl)",
      });
    }

    const updateOps = req.body;

    // Validate request body
    if (Object.keys(updateOps).length === 0) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const result = await User.findByIdAndUpdate(
      id,
      { $set: updateOps },
      { new: true }
    )
      .select("-password")
      .exec();
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

async function deleteUser(req, res, next) {
  try {
    const id = req.params.id;

    const result = await User.deleteOne({ _id: id }).exec();
    if (result.deletedCount > 0) {
      res.status(200).json({ message: "User deleted" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getUsers,
  getUser,
  signUp,
  logIn,
  renewToken,
  updateUser,
  deleteUser,
};
