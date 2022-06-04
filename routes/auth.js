const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const adminKey = req.body.adminKey;

  if (username && email && password && adminKey == process.env.ADMIN_KEY) {
    // ADMIN REGISTER
    const newAdmin = new User({
      username,
      email,
      password: CryptoJS.AES.encrypt(password, process.env.SEC_PASS).toString(),
      isAdmin: true,
    });
    try {
      const savedAdmin = await newAdmin.save();
      res.status(201).json(savedAdmin);
    } catch (err) {
      res.status(500).json(err);
    }
  } else if (
    // USER REGISTER
    username &&
    email &&
    password
  ) {
    const newUser = new User({
      username,
      email,
      password: CryptoJS.AES.encrypt(password, process.env.SEC_PASS).toString(),
    });

    try {
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(400).json("Please enter fully your information");
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const username = req.body.username;
  const userPassword = req.body.password;

  try {
    const user = await User.findOne({ username });
    !user && res.status(401).json("Wrong credentials!");

    const unhashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.SEC_PASS
    ).toString(CryptoJS.enc.Utf8);

    userPassword !== unhashedPassword &&
      res.status(401).json("Wrong credentials!");

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password, ...info } = user._doc;

    res.status(200).json({ ...info, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
