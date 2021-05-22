import { Socket } from "socket.io";
import { ChatUtils } from "../../app/services";
import { SequelizeAttributes } from "../../sequelize/types";
import { Logger } from "../../sequelize/utils/logger";
import { SocketRoom } from "../models";
import { IOEvents } from "./index";

export async function OnJoinRoom(socket: Socket, data: SocketRoom) {
	try {
		console.log(IOEvents.JOIN_ROOM);
		if (!data.chatId) throw "chatId is required on Join Room";
		let chat = await ChatUtils.getChatByUuid(
			data.chatId,
			SequelizeAttributes.WithIndexes
		);
		socket.roomsJoined[chat.chatId] = chat._chatId;
		socket.join(chat.chatId);
		socket.emit(IOEvents.JOIN_ROOM, { data: chat.chatId, success: true });
	} catch (error) {
		Logger.error(error);
		socket.emit(IOEvents.JOIN_ROOM, {
			data: data.chatId,
			success: false,
			error,
		});
	}
}
