import { Socket } from "socket.io";
import { IOEvents } from "./index";

export const OnDisconnect = (socket: Socket) => {
	console.log(IOEvents.DISCONNECT);
	if (socket.userId) {
		socket.leave(socket.userId);
		for (let key in socket.roomsJoined) {
			socket.leave(key);
		}
	}
};
