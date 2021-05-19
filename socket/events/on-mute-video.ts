import { Socket } from "socket.io";
import { Logger } from "../../sequelize/utils/logger";
import { IOEvents } from "./index";

export function OnMuteVideo(socket: Socket) {
	try {
		console.log(IOEvents.MUTE_VIDEO, socket.meetingId);
		if (socket.meetingId)
			socket.to(socket.meetingId).emit(IOEvents.MUTE_VIDEO, {userId: socket.userId});
	} catch (error) {
		Logger.error(error);
	}
};
