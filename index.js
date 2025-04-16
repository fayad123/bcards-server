const express = require("express");
const app = express();
const towEnv = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
require("dotenv").config({path: towEnv});
const cors = require("cors");
const users = require("./routes/users");
const cards = require("./routes/cards");
const chalk = require("chalk");
const mongoose = require("mongoose");
const {logToFile, logger} = require("./middlewares/logger");
const expressRoutes = require("express-list-routes")

const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(logger);
logToFile();

// MongoDB connection
mongoose
	.connect(process.env.DB)
	.then(() =>
		console.log(
			chalk.white(
				"Server connected to MongoDB",
				chalk.blue(new Date().toLocaleString()),
			),
		),
	)
	.catch((error) => {
		console.log(chalk.red.bold(error));
	});

// Routes
app.use("/api/users", users);
app.use("/api/cards", cards);

// Start server
app.listen(port, () => console.log(chalk.yellow("Server started on port:"), port));


if (process.env.NODE_ENV === "development") {
	console.log(chalk.red.bold("App is running in Development mode"));
	expressRoutes(app);
} else {
	console.log(chalk.bgBlueBright.bold("App is running in Production mode"));
}
