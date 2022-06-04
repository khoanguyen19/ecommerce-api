const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (!authHeader) {
    return res.status(401).json("You're not authenticated");
  }
  const token = authHeader.substring(7);
  jwt.verify(token, process.env.JWT_SEC, (err, user) => {
    if (err) {
      res.status(403).json("Token is invalid");
    }
    req.user = user;
    next();
  });
};

const authorizeUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You're not authorized to do that!");
    }
  });
};

const authorizeAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You're not authorized to do that!");
    }
  });
};

module.exports = { verifyToken, authorizeUser, authorizeAdmin };
