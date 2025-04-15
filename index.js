const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const users = require("./routes/users");
const cards = require("./routes/cards");
const chalk = require("chalk");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

const port = process.env.PORT || 5000;

const accessLogDir = path.join(__dirname, "logs", "access");
const errorLogDir = path.join(__dirname, "logs", "errors");

if (!fs.existsSync(accessLogDir))
  fs.mkdirSync(accessLogDir, { recursive: true });
if (!fs.existsSync(errorLogDir)) fs.mkdirSync(errorLogDir, { recursive: true });

const accessLogStream = fs.createWriteStream(
  path.join(accessLogDir, "access.log"),
  { flags: "a" }
);

const errorLogStream = fs.createWriteStream(
  path.join(errorLogDir, "errors.log"),
  { flags: "a" }
);

// Morgan for access logs
app.use(morgan("short", { stream: accessLogStream }));

// Logger with chalk (console)
const logger = (req, res, next) => {
  console.log(chalk.green(`${req.method} ${req.originalUrl}`));
  next();
};

// Middleware
app.use(express.json());
app.use(cors());
app.use(logger);

// MongoDB connection
mongoose
  .connect(process.env.DB)
  .then(() =>
    console.log(
      chalk.white(
        "Server connected to MongoDB",
        chalk.blue(new Date().toLocaleString())
      )
    )
  )
  .catch((error) => {
    console.log(chalk.red.bold(error));
    errorLogStream.write(error);
  });

// Routes
app.use("/api/users", users);
app.use("/api/cards", cards);

// Global error handler
app.use((err, req, res, next) => {
  const errorLog = `${new Date().toISOString()} - ${req.method} ${
    req.originalUrl
  } - ${err.message}\n`;
  console.error(chalk.red("Unhandled error:"), err);
  errorLogStream.write(errorLog);
  res.status(500).json({ message: "Something went wrong" });
});

// Start server
app.listen(port, () =>
  console.log(chalk.yellow("Server started on port:"), port)
);
