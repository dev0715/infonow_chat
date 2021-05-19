import { Socket } from "socket.io";
import { Logger } from "../../sequelize/utils/logger";
import { IOEvents } from "./index";

export const OnUnmuteAudio = (socket: Socket) => {
	try {
		console.log(IOEvents.UNMUTE_AUDIO, socket.meetingId);
		if (socket.meetingId)
			socket.to(socket.meetingId).emit(IOEvents.UNMUTE_AUDIO, {userId: socket.userId});
	} catch (error) {
		Logger.error(error)
	}

};
