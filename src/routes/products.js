const express = require("express");
const router = express.Router();
const controller = require("../controllers/products");
const checkAuth = require('../middlewares/check-auth');

/* GET products. */
router.get("/", controller.getProducts);

/* GET custom product. */
router.get("/:id",controller.getProduct);

/* POST Create product */
router.post("/" , controller.createProduct);

/* Update custom product */
router.patch("/:id" ,controller.updateProduct);

/* DELETE custom product */
router.delete("/:id" ,controller.deleteProduct);

module.exports = router;
