import { Server, Socket } from "socket.io";
import { ChatParticipantUtils } from "../../app/services/chat-participant";
import { ValidationError } from "../../sequelize/utils/errors";
import { Logger } from "../../sequelize/utils/logger";
import { BlockChatData } from "../models";
import { IOEvents } from "./index";

export async function OnBlockChat(
	io: Server,
	socket: Socket,
	data: BlockChatData
) {
	try {
		console.log(IOEvents.BLOCK_CHAT);
		if (!socket.userId || !socket.user) {
			throw new ValidationError("User not found");
		}
		if (!socket.roomsJoined[data.chatId]) {
			throw new ValidationError("No chat found");
		}
		let chatParticipants = await ChatParticipantUtils.blockParticipantChat(
			socket.roomsJoined[data.chatId],
			socket.user._userId!
		);

		io.sockets.in(data.chatId).emit(IOEvents.BLOCK_CHAT, {
			chatId: data.chatId,
			data: chatParticipants,
			success: true,
		});

		socket.leave(data.chatId);
		delete socket.roomsJoined[data.chatId];
	} catch (error) {
		Logger.error(error);
		socket.emit(IOEvents.BLOCK_CHAT, {
			success: false,
			error: error,
		});
	}
}
