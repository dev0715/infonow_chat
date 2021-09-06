import { Socket } from "socket.io";
import { IOEvents } from "./index";

import { SocketRoom } from "../models";
import { Logger } from "../../sequelize/utils/logger";

export const OnLeaveRoom = (socket: Socket, data: SocketRoom) => {
	console.log(IOEvents.LEAVE_ROOM, data);
	try {
		socket.leave(data.chatId);
	} catch (error) {
		Logger.error(error);
	}
};
