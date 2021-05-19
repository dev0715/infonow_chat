"use strict";
import PublicRouter from "./public";
import { CoreHttpErrorHandler, RequestParameters } from "../../sequelize/middlewares/error";
import { DataResponse } from "../../sequelize/utils/http-response";
import express, { Request, Response, NextFunction, Router } from "express";
import cors from "cors";
import chalk from "chalk";
import ApiRouter from "./api";
import { User } from "../../sequelize/models/User";
const PRINT_REQUESTED_URL = true;



export default ((): Router => {
	const server = express.Router();

	server.use("*", (req: Request, res: Response, next) => {
		if (PRINT_REQUESTED_URL)
			console.log(
				`${req.method}: ${chalk.greenBright(
					chalk.bold(req.originalUrl)
				)}`
			);
		return next();
	});

	server.use(cors());

	// Public Routes
	server.use(PublicRouter);

	// API Routes
	server.use(ApiRouter);

	// Global Http Error Handler
	server.use(CoreHttpErrorHandler);

	// Un-recognized Urls
	server.use((req: Request, res: Response) => {
		const params = RequestParameters(req);
		DataResponse(
			res,
			404,
			{ url: req.originalUrl, params },
			"The resource you are looking for is not found!"
		);
	});

	return server;
})();
