import { Socket } from "socket.io";
import { Logger } from "../../sequelize/utils/logger";
import { IOEvents } from "./index";

export const OnVideoSharing = (socket: Socket) => {
	try {
		console.log(IOEvents.VIDEO_SHARING, socket.meetingId);
		if (socket.meetingId) 
			socket.to(socket.meetingId).emit(IOEvents.VIDEO_SHARING);
	} catch (error) {
		Logger.error(error)
	}
};
