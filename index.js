const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const users = require("./routes/users");
const cards = require("./routes/cards");
const chalk = require("chalk");
const mongoose = require("mongoose");

const port = process.env.PORT || 5000;

const logger = (req, res, next) => {
  console.log(chalk.green(req.method + req.url));
  next();
};

app.use(express.json());
app.use(logger);
app.use(cors());

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
  .catch((error) =>
    console.log(chalk.red.bold("Error while connecting to MongoDB:"), error)
);
  

app.use("/api/users", users);
app.use("/api/cards", cards);

app.listen(port, () => console.log("Server started on port:", port));
