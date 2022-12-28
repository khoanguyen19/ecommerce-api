const router = require("express").Router();
const User = require("../models/User");
const { authorizeUser, authorizeAdmin } = require("../middlewares/verifyToken");
const CryptoJS = require("crypto-js");

// CREATE
router.post("/", async (req, res) => {
  req.body.password = CryptoJS.AES.encrypt(
    req.body.password,
    process.env.SEC_PASS
  ).toString();
  const newUser = new User(req.body);
  try {
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SEC_PASS
    ).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.body._id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    await User.findByIdAndDelete(_id);
    res.status(200).json("This user has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL USERS
router.get("/find", async (req, res) => {
  const query = req.query.new;
  try {
    const user = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET
router.get("/find/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...info } = user._doc;
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET USER STATS
router.get("/stats", async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
