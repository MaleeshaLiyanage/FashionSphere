const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.user.id).select("-password"); // Exclude password

      // check user is verified or not
      if (!user.isVerified) {
        return res
          .status(401)
          .json({ message: "Not authorized, account is not verified" });
      }

      req.user = user; // Attach user to request object

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// Middleware to check if the user is an admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

// Middleware to identify authenticated users
// this can access both authenticated and non-authenticated users.
// if user is authenticated, it will attach the user to the request object.
const identifyUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.user.id).select("-password"); // Exclude password

      req.user = user; // Attach user to request object
    } catch (error) {
      console.error(error);
    }
  }

  next();
};

module.exports = { protect, admin, identifyUser };
