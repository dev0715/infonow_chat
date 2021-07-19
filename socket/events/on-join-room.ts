import moment from "moment";
import { Server, Socket } from "socket.io";
import { ChatUtils } from "../../app/services";
import { ChatParticipantUtils } from "../../app/services/chat-participant";
import { SequelizeAttributes } from "../../sequelize/types";
import { ValidationError } from "../../sequelize/utils/errors";
import { Logger } from "../../sequelize/utils/logger";
import { SocketRoom } from "../models";
import { IOEvents } from "./index";

export async function OnJoinRoom(io: Server, socket: Socket, data: SocketRoom) {
	try {
		console.log(IOEvents.JOIN_ROOM);
		if (!data.chatId)
			throw new ValidationError("chatId is required on Join Room");
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

		if (user.blockedAt) {
			throw new ValidationError("User is Blocked");
		}

		let participants =
			await ChatParticipantUtils.setParticipantMessagesDelivered({
				chatParticipantId: socket.user!._userId!,
				chatId: chat._chatId,
				deliveredAt: moment().utc(),
			});

		socket.roomsJoined[chat.chatId] = chat._chatId;
		socket.join(chat.chatId);

		socket.emit(IOEvents.JOIN_ROOM, { chatId: chat.chatId, success: true });

		io.sockets.in(data.chatId).emit(IOEvents.MESSAGES_DELIVERED, {
			chatId: chat.chatId,
			data: participants,
			success: true,
		});
	} catch (error) {
		Logger.error(error);
		socket.emit(IOEvents.JOIN_ROOM, {
			chatId: data.chatId,
			success: false,
			error: error,
		});
	}
}
