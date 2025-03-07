const express = require("express");
const router = express.Router();
const controller = require("../controllers/orders");
const checkAuth = require('../middlewares/check-auth');

/* GET orders. */
router.get("/", checkAuth,   controller.getOrders);

/* GET custom order. */
router.get("/:id",checkAuth, controller.getOrder);

/* POST Create order */
router.post("/" , checkAuth, controller.createOrder);

/* Update custom order */
router.patch("/:id" ,checkAuth,  controller.updateOrder);

/* DELETE custom order */
router.delete("/:id" , checkAuth, controller.deleteOrder);

module.exports = router;
