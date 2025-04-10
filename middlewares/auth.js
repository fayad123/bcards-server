const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(401).send("Access denied. no token provided");
    req.payload = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(400).send(error);
  }
};
