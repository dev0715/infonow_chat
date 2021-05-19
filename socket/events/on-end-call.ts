import { Socket } from "socket.io";
import { SocketRoom } from "../models";
import { Redis } from "../../redis";
import { IOEvents } from "./index";

export const OnEndCall = (socket: Socket) => {
	console.log(IOEvents.END_CALL);	
	if (socket.meetingId) {
		socket.to(socket.meetingId).emit(IOEvents.END_CALL, socket.meetingId);
		Redis.getInstance().del(socket.meetingId);
		socket.leave(socket.meetingId);
	}
};
