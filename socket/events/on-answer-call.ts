import { Socket } from "socket.io";
import { Logger } from "../../sequelize/utils/logger";
import { SocketData } from "../models";
import { IOEvents } from "./index";

export const OnAnswerCall = (socket: Socket, res: SocketData) => {
	try {
		console.log(IOEvents.ANSWER_CALL, socket.meetingId);
		socket.to(socket.meetingId!).emit(IOEvents.RECEIVE_ANSWER, res.data);
	} catch (error) {
		Logger.error(error)
	}
};
