import { Server, Socket } from "socket.io";
import { ChatUtils } from "../../app/services";
import { ChatParticipantUtils } from "../../app/services/chat-participant";
import { SequelizeAttributes } from "../../sequelize/types";
import { ValidationError } from "../../sequelize/utils/errors";
import { Logger } from "../../sequelize/utils/logger";
import { BlockChatData } from "../models";
import { IOEvents } from "./index";

export async function OnUnBlockChat(
	io: Server,
	socket: Socket,
	data: BlockChatData
) {
	try {
		console.log(IOEvents.UNBLOCK_CHAT);
		if (!socket.userId || !socket.user) {
			throw new ValidationError("User not found");
		}
		let chat = await ChatUtils.getChatByUuid(
			data.chatId,
			SequelizeAttributes.WithIndexes
		);

		let user = chat.chatParticipants.find(
			(x) => x.user.userId === socket.userId!
		);

		if (!user) {
			throw new ValidationError("invalid participant");
		}

		let chatParticipants =
			await ChatParticipantUtils.unBlockParticipantChat(
				chat._chatId,
				socket.user._userId!
			);

		io.sockets.in(data.chatId).emit(IOEvents.UNBLOCK_CHAT, {
			chatId: data.chatId,
			data: chatParticipants,
			success: true,
		});
		socket.roomsJoined[chat.chatId] = chat._chatId;
		socket.join(chat.chatId);
	} catch (error) {
		Logger.error(error);
		socket.emit(IOEvents.UNBLOCK_CHAT, {
			success: false,
			error: error,
		});
	}
}
