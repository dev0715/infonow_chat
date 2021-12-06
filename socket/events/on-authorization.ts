import { Server, Socket } from "socket.io";
import { IOEvents, OnRemoveParticipants } from ".";
import { User } from "../../sequelize";
import { TokenCore } from "../../sequelize/middlewares/auth/token";
import { SocketData } from "../models";
import {
	OnJoinRoom,
	OnJoinGlobalRoom,
	OnGetPreviousMessages,
	OnNewChatMessage,
} from "./";
import { OnAddParticipants } from "./on-add-participants";
import { OnBlockChat } from "./on-block-chat";
import { OnLeaveRoom } from "./on-leave-room";
import { OnMessagesDelete } from "./on-messages-delete";
import { OnUnBlockChat } from "./on-unblock-chat";

async function authorizeUser(token: string) {
	let user = await TokenCore.Verify(token);
	return user as User;
}

export async function OnAuthorization(
	io: Server,
	socket: Socket,
	data: SocketData
) {
	try {
		
		if (data.authorization) {
			let user = await authorizeUser(data.authorization);
			socket.userId = user.userId;
			socket.user = user;
			socket.roomsJoined = {};

			
			socket.emit(IOEvents.AUTHORIZATION, { success: true });

			//------------ATTACH EVENTS----------//

			socket.on(IOEvents.JOIN_ROOM, (data) =>
				OnJoinRoom(io, socket, data)
			);

			socket.on(IOEvents.LEAVE_ROOM, (data) => OnLeaveRoom(socket, data));

			socket.on(IOEvents.JOIN_GLOBAL_ROOM, () =>
				OnJoinGlobalRoom(socket)
			);

			socket.on(IOEvents.NEW_MESSAGE, (data) =>
				OnNewChatMessage(io, socket, data)
			);

			socket.on(IOEvents.GET_PREVIOUS_MESSAGES, (data) =>
				OnGetPreviousMessages(io, socket, data)
			);

			socket.on(IOEvents.ADD_PARTICIPANT, (data) =>
				OnAddParticipants(io, socket, data)
			);

			socket.on(IOEvents.REMOVE_PARTICIPANT, (data) =>
				OnRemoveParticipants(io, socket, data)
			);

			socket.on(IOEvents.MESSAGES_DELETE, (data) =>
				OnMessagesDelete(socket, data)
			);

			socket.on(IOEvents.BLOCK_CHAT, (data) =>
				OnBlockChat(io, socket, data)
			);

			socket.on(IOEvents.UNBLOCK_CHAT, (data) =>
				OnUnBlockChat(io, socket, data)
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
