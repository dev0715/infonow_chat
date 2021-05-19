import { Socket } from "socket.io";
import { Logger } from "../../sequelize/utils/logger";
import { IOEvents } from "./index";

export const OnStartCall = (socket: Socket) => {
	try {
		console.log(IOEvents.START_CALL, socket.meetingId);
		if (socket.meetingId) {
			socket.to(socket.meetingId).emit(IOEvents.START_CALL);
			socket.emit(IOEvents.START_CALL);
		}
	} catch (error) {
		Logger.error(error);
	}

};
