const fs = require("fs");
const path = require("path");

const logToFile = (statusCode, errorMessage) => {
	const date = new Date();
	const formattedDate = date.toISOString().split("T")[0];
	const logDir = path.join(__dirname, "../logs");
	const logFilePath = path.join(logDir, `${formattedDate}.log`);

	// Create the logs directory if it doesn't exist
	if (!fs.existsSync(logDir)) {
		fs.mkdirSync(logDir, {recursive: true});
	}

	// Prepare log message
	const logMessage = `${new Date().toLocaleString()} - Status Code: ${statusCode} - Error: ${errorMessage}\n`;

	// Append the log message to the file
	fs.appendFile(logFilePath, logMessage, (err) => {
		if (err) {
			console.error("Error writing to log file:", err);
		}
	});
};

// Logger middleware
const logger = (req, res, next) => {
	const originalSend = res.send;
	const startTime = Date.now();

	res.send = function (body) {
		const timeTaken = Date.now() - startTime;

		if (res.statusCode >= 400) {
			logToFile(res.statusCode, body);
		} else {
			const accessLogMessage = `${new Date().toLocaleString()} | ${req.method} ${
				req.url
			} | Status: ${res.statusCode} | ${timeTaken}ms\n`;

			const accessDir = path.join(__dirname, "../access");

			if (!fs.existsSync(accessDir)) {
				fs.mkdirSync(accessDir, {recursive: true});
			}

			fs.appendFile(
				path.join(accessDir, `${new Date().toISOString().split("T")[0]}.log`),
				accessLogMessage,
				(err) => {
					if (err) console.error("Error logging access:", err);
				},
			);
		}

		originalSend.call(this, body);
	};

	next();
};

module.exports = {logger, logToFile};
