import { Server, Socket } from "socket.io";
import { SocketData, SocketOffer } from "../models";
import { Redis } from "../../redis";
import { IOEvents } from "./index";
import { getClientsInRoom } from "./utils";

export function OnJoinRoom(
	io: Server,
	socket: Socket,
	res: SocketData
) {
	let meetingId = res.meetingId!;
	console.log(IOEvents.ROOM_JOIN, meetingId);

	let clients = getClientsInRoom(io, meetingId);
	let roomNotFoundMessage = { message: socket.t("No meeting found") };

	if (clients?.size === 0) {
		return socket.emit(IOEvents.ROOM_NOT_FOUND, roomNotFoundMessage);
	}

	console.log("Room found");

	Redis.getInstance().get(meetingId, (err: any, reply: any) => {
		if (err) {
			return socket.emit(IOEvents.ROOM_NOT_FOUND, roomNotFoundMessage);
		}

		let data: SocketOffer = JSON.parse(reply);
		let userAlreadyJoined = data.userId === socket.userId;
		
		if (userAlreadyJoined) {
			let message = socket.t("already joined on another client");
			socket.emit(IOEvents.ALREADY_JOINED, { message: message });
		} else {
			socket.meetingId = meetingId;
			socket.join(meetingId);
			socket.emit(IOEvents.ROOM_JOIN, data.offer);
			socket.emit(IOEvents.JOINED_ROOM_AS_RECEIVER);
		}
	});
};
