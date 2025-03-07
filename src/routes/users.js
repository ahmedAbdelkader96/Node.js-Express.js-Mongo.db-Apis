const express = require("express");
const router = express.Router();

const UserController = require("../controllers/users");
const checkAuth = require("../middlewares/check-auth");

router.get("/", UserController.getUsers);

router.get("/:id", UserController.getUser);

router.post("/signUp", UserController.signUp);

router.post("/logIn", UserController.logIn);

router.post("/renewToken", UserController.renewToken);

router.patch("/:id", UserController.updateUser);

router.delete("/:id", UserController.deleteUser);

module.exports = router;
