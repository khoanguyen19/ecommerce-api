const router = require("express").Router();
const Cart = require("../models/Cart");
const {
  verifyToken,
  authorizeUser,
  authorizeAdmin,
} = require("../middlewares/verifyToken");

// CREATE
router.post("/", verifyToken, async (req, res) => {
  const newCart = new Cart(req.body);
  try {
    const savedCart = await newCart.save();
    res.status(200).json(savedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE
router.delete("/:id", verifyToken, async (req, res) => {
  const _id = req.params.id;
  try {
    await Cart.findByIdAndDelete(_id);
    res.status(200).json("This cart has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL
router.get("/find", authorizeAdmin, async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET USER CART
router.get("/find/:userId", authorizeAdmin, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
