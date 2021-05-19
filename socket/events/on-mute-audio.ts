import { Socket } from "socket.io";
import { Logger } from "../../sequelize/utils/logger";
import { IOEvents } from "./index";

export function OnMuteAudio(socket: Socket) {
	try {
		console.log(IOEvents.MUTE_AUDIO, socket.meetingId);
		if (socket.meetingId)
			socket.to(socket.meetingId).emit(IOEvents.MUTE_AUDIO,{ userId: socket.userId });
	} catch (error) {
		Logger.error(error)
	}	
};
