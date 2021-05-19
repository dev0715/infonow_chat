import express from "express"; // using express
import http from "http";
import { createAdapter } from "socket.io-redis";
import { Socket } from "socket.io";
import { Server } from 'socket.io';
import Configs from "../configs";
import { OnConnect } from "./events/on-connect";
import { Logger } from "../sequelize/utils/logger";
import { RedisClient } from "redis";
import chalk from "chalk";
import { User } from "../sequelize";

const socketConfig = Configs!.WSServerConfigurations;
const redisConfig = Configs!.RedisServerConfiguration;

declare module "socket.io" {
	interface Socket {
		t(message: string, ...args: any): string;
		locale: string;
		userId?: string;
		meetingId?: string;
		user?: User
	}
}

export const StartSocketServer = () => {
	try {
		let app = express();
		let server = http.createServer(app);
		Logger.infoBright("* Attempting to start Socket Server");
		let io = new Server(server);
		const pubClient = new RedisClient(redisConfig);
		const subClient = pubClient.duplicate();
		io.adapter(createAdapter({ pubClient, subClient }));

		// make connection with user from server side
		io.on("connection", (socket: Socket) => OnConnect(io, socket));

		const port = socketConfig.port; // setting the port
		const onLaunchServer = () => {
			console.timeEnd('* Server start process took')
			Logger.info(`* Socket Server is Live at: ${chalk.bold.greenBright(socketConfig.host + ':' + port)} \\o/`)
		}

		server.listen(port, onLaunchServer);
	} catch (error) {
		Logger.error(error);
	}
};
