"use strict";

import GlobalConfig from "./configs";
import { Logger, LogType } from "./sequelize/utils/logger";
import * as App from "./app";
import { sequelize } from "./sequelize";
import { StartSocketServer } from "./socket";
import { initLocalization } from "./sequelize/locales";

require("source-map-support").install();

export async function Start(): Promise<boolean> {
	let severStarted = false;
	try {
		Logger.successBold(
			"* -------------------------------------------------------- *"
		);
		Logger.successBold(
			"|              Attempting to start the Server              |"
		);
		Logger.successBold(
			"* -------------------------------------------------------- *"
		);

		const HttpServerConfig = GlobalConfig?.HTTPServerConfigurations;

		// Syncing Sequelize Models
		await sequelize.sync();

		// Initializing Localization
		initLocalization();

		Logger.infoBright("* Attempting to start the Server");
		Logger.info("* This process will start HTTP server...");

		// Starting Http Server
		let expressApp = App.create(HttpServerConfig);
		App.start(expressApp);

		severStarted = true;

		// Enabling Types of Logs Printed
		Logger.logConfig = [
			LogType.Error,
			LogType.Debug,
			LogType.Success,
			LogType.Info,
		];
	} catch (err) {
		console.log("START_ERROR", err);
		Logger.fatalError(
			"* -------------------------------------------------------- *"
		);
		Logger.fatalError(
			"|                Failed to start the Server                |"
		);
		Logger.fatalError(
			"* -------------------------------------------------------- *"
		);
		severStarted = false;
	} finally {
		return severStarted;
	}
}

(async () => {
	Start();
	StartSocketServer();
})();
