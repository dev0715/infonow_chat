import { Socket } from "socket.io";
import { ChatParticipantUtils } from "../../app/services/chat-participant";
import { ValidationError } from "../../sequelize/utils/errors";
import { Logger } from "../../sequelize/utils/logger";
import { MessageDeleteData } from "../models";
import { IOEvents } from "./index";

export async function OnMessagesDelete(
	socket: Socket,
	data: MessageDeleteData
) {
	try {
		console.log(IOEvents.MESSAGES_DELETE);
		if (!socket.userId || !socket.user) {
			throw new ValidationError("User not found");
		}
		if (!socket.roomsJoined[data.chatId]) {
			throw new ValidationError("No chat found");
		}
		let messages = await ChatParticipantUtils.deleteParticipantChat(
			socket.roomsJoined[data.chatId],
			socket.user!._userId!,
			data.lastMessageTime
		);
		socket.emit(IOEvents.MESSAGES_DELETE, {
			success: true,
			data: messages,
		});
	} catch (error) {
		Logger.error(error);
		socket.emit(IOEvents.MESSAGES_DELETE, {
			success: false,
			error: error,
		});
	}
}
