"use strict";

/**
 * Dependencies of This Application
 */
import express from "express";
import helmet from "helmet";
import routes from "./routes";
import https from "https";
import chalk from "chalk";
import { getSSLConfigurations } from "../configs/ssl-configs";
import { Logger } from "../sequelize/utils/logger";
import cors from "cors";
import i18n from "i18n";
import { User } from "../sequelize";

declare global {
	namespace Express {
		interface Request {
			CurrentUser?: User;
			__?: i18nAPI;
		}
	}
}

export function create(config: any): any {
	// Server settings
	const expressApp = express();
	expressApp.set("env", config.env);
	expressApp.set("port", config.port);
	expressApp.set("hostname", config.host);
	expressApp.set("sslEnabled", config.sslEnabled);

	// Initializing Localization
	expressApp.use(i18n.init);

	expressApp.use(cors());

	// Returns middleware that parses json
	// parse application/x-www-form-urlencoded
	expressApp.use(express.urlencoded({ extended: false }));

	// parse application/json
	expressApp.use(express.json());

	expressApp.use(helmet());

	expressApp.use(routes);
	// Set up routes

	return expressApp;
}

export function start(server: any): any {
	const hostname = server.get("hostname"),
		port = server.get("port"),
		sslEnabled = server.get("sslEnabled");

	console.time("* Server start process took");

	Logger.info(
		`* Attempting to start the Web Server at: ${chalk.bold.greenBright(
			hostname + ":" + port
		)}`
	);
	const onLaunchServer = () => {
		console.timeEnd("* Server start process took");
		Logger.info(
			`* Server is Live at: ${chalk.bold.greenBright(
				hostname + ":" + port
			)} \\o/`
		);
	};

	if (sslEnabled) {
		const secureServer = https.createServer(
			getSSLConfigurations(0)!,
			server
		);
		secureServer.listen(port, onLaunchServer);
	} else {
		server.listen(port, onLaunchServer);
	}
}
