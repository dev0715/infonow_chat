import { Socket } from "socket.io";
import { Logger } from "../../sequelize/utils/logger";
import { IOEvents } from "./index";

export const OnUnmuteVideo = (socket: Socket) => {
	try {
		console.log(IOEvents.UNMUTE_VIDEO, socket.meetingId);
		if (socket.meetingId)
			socket.to(socket.meetingId).emit(IOEvents.UNMUTE_VIDEO, {userId: socket.userId});
	} catch (error) {
		Logger.error(error)
	}

};
