const router = require("express").Router();
const Order = require("../models/Order");
const { verifyToken, authorizeAdmin } = require("../middlewares/verifyToken");

// CREATE
router.post("/", async (req, res) => {
  const userId = req.user.id;
  const clientOrder = req.body;
  const newOrder = new Order({ userId, ...clientOrder });
  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    await Order.findByIdAndDelete(_id);
    res.status(200).json("This order has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL
router.get("/find", async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
    ]);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET USER ORDERS
router.get("/find/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET INCOME
router.get("/income", async (req, res) => {
  const qYear = req.query.year;
  const productId = req.query.pid;
  const date = new Date();

  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));

  if (productId || qYear) {
    // Get income in specified year
    try {
      const income = await Order.aggregate([
        {
          $match: {
            ...(qYear
              ? {
                  createdAt: {
                    $gte: new Date(qYear, 0, 1),
                    $lte: new Date(qYear, 11, 31),
                  },
                }
              : {
                  createdAt: { $gte: lastMonth },
                }),
            ...(productId && {
              products: { $elemMatch: { productId } },
            }),
            status: { $eq: "Approved" },
          },
        },
        {
          $project: {
            ...(qYear
              ? {
                  year: { $year: "$createdAt" },
                }
              : {
                  month: { $month: "$createdAt" },
                }),
            sales: "$amount",
          },
        },
        {
          $group: {
            ...(qYear
              ? {
                  _id: "$year",
                }
              : {
                  _id: "$month",
                }),

            totalSales: { $sum: "$sales" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
      res.status(200).json(income);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    //Get income in last 2 months (default)

    try {
      const income = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: lastMonth },
            status: { $eq: "Approved" },
          },
        },
        {
          $project: {
            month: { $month: "$createdAt" },
            sales: "$amount",
          },
        },
        {
          $group: {
            _id: "$month",
            totalSales: { $sum: "$sales" },
          },
        },
        {
          $sort: { _id: -1 },
        },
      ]);
      res.status(200).json(income);
    } catch (err) {
      res.status(500).json(err);
    }
  }
});

module.exports = router;
