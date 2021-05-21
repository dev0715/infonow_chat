import { Socket } from "socket.io";
import { IOEvents } from ".";
import { User } from "../../sequelize";
import { TokenCore } from "../../sequelize/middlewares/auth/token";
import { SocketData } from "../models";
import {
	OnJoinRoom,
	OnJoinGlobalRoom,
	OnGetPreviousMessages,
	OnNewChatMessage,
} from "./";

async function authorizeUser(token: string) {
	let user = await TokenCore.Verify(token);
	return user as User;
}

export async function OnAuthorization(socket: Socket, data: SocketData) {
	try {
		if (data.authorization) {
			let user = await authorizeUser(data.authorization);
			socket.userId = user.userId;
			socket.user = user;
			socket.roomsJoined = {};

			console.log(`USER AUTHORIZED`);
			socket.emit(IOEvents.AUTHORIZATION, { success: true });

			//------------ATTACH EVENTS----------//

			socket.on(IOEvents.JOIN_ROOM, (data) => OnJoinRoom(socket, data));

			socket.on(IOEvents.JOIN_GLOBAL_ROOM, () =>
				OnJoinGlobalRoom(socket)
			);

			socket.on(IOEvents.NEW_MESSAGE, (data) =>
				OnNewChatMessage(socket, data)
			);

			socket.on(IOEvents.GET_PREVIOUS_MESSAGES, (data) =>
				OnGetPreviousMessages(socket, data)
			);
		} else {
			socket.emit(IOEvents.AUTHORIZATION, { success: false });
			socket.disconnect();
		}
	} catch (err) {
		console.log(err);
		socket.emit(IOEvents.AUTHORIZATION, { success: false });
		socket.disconnect();
	}
}
