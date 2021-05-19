import { Socket } from "socket.io";
import { Logger } from "../../sequelize/utils/logger";
import { IOEvents } from "./index";

export const OnScreenSharing = (socket: Socket) => {
	try {
		console.log(IOEvents.SCREEN_SHARING, socket.meetingId);
		if (socket.meetingId)
			socket.to(socket.meetingId).emit(IOEvents.SCREEN_SHARING, { userId: socket.userId });
	} catch (error) {
		Logger.error(error)
	}
};
