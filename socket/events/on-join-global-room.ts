import { Socket } from "socket.io";
import { Logger } from "../../sequelize/utils/logger";
import { IOEvents } from "./index";

export function OnJoinGlobalRoom(socket: Socket) {
	try {
		console.log(IOEvents.JOIN_GLOBAL_ROOM);
		if (!socket.userId) {
			throw "user not found";
		}
		socket.join(socket.userId);
		socket.emit(IOEvents.JOIN_GLOBAL_ROOM, { success: true });
	} catch (error) {
		Logger.error(error);
		socket.emit(IOEvents.JOIN_GLOBAL_ROOM, {
			success: false,
			error: error,
		});
	}
}
