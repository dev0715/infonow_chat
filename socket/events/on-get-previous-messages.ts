import moment from "moment";
import { Server, Socket } from "socket.io";
import { ChatParticipantUtils } from "../../app/services/chat-participant";
import { MessageUtils } from "../../app/services/message";
import { Logger } from "../../sequelize/utils/logger";
import { PreviousMessageData } from "../models";
import { IOEvents } from "./index";

export async function OnGetPreviousMessages(
	io: Server,
	socket: Socket,
	data: PreviousMessageData
) {
	try {
		console.log(IOEvents.GET_PREVIOUS_MESSAGES);

		let chatId = socket.roomsJoined[data.chatId];
		if (!chatId) throw "chatId not joined";

		socket.activeRoom = data.chatId;

		let messages = await MessageUtils.getChatMessagesByChatId(
			chatId,
			data.dateTime ?? moment().utc()
		);

		let participants =
			await ChatParticipantUtils.setParticipantMessagesSeen({
				chatParticipantId: socket.user!._userId!,
				chatId: socket.roomsJoined[data.chatId],
				seenAt: moment().utc(),
			});

		socket.emit(IOEvents.GET_PREVIOUS_MESSAGES, {
			chatId: data.chatId,
			data: messages,
			success: true,
		});

		io.sockets.in(data.chatId).emit(IOEvents.MESSAGES_SEEN, {
			chatId: data.chatId,
			data: participants,
			success: true,
		});
	} catch (error) {
		Logger.error(error);
		socket.emit(IOEvents.GET_PREVIOUS_MESSAGES, {
			chatId: data.chatId,
			success: false,
			error: error,
		});
	}
}
