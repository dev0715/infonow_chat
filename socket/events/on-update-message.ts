import moment from "moment";
import { Socket } from "socket.io";
import { MessageUtils } from "../../app/services/message";
import { Logger } from "../../sequelize/utils/logger";
import { UpdateMessageSchemaType } from "../../sequelize/validation-schema";
import { UpdateChatMessage } from "../models";
import { IOEvents } from "./index";

export async function OnUpdateMessage(socket: Socket, data: UpdateChatMessage) {
	try {
		console.log(IOEvents.UPDATE_MESSAGE);

		if (!data.chatId || !data.messageId) {
			throw "Update Message data is not complete";
		}
		let msg: UpdateMessageSchemaType = {
			messageId: data.messageId,
			seenAt: data.dateTime ?? moment().utc(),
		};

		let updatedMessage = await MessageUtils.updateMessage(msg);

		socket.broadcast.to(data.chatId).emit(IOEvents.UPDATE_MESSAGE, {
			chatId: data.chatId,
			messageId: data.messageId,
			data: updatedMessage,
			success: true,
		});
	} catch (error) {
		Logger.error(error);
		socket.emit(IOEvents.NEW_MESSAGE, {
			chatId: data.chatId,
			messageId: data.messageId,
			success: false,
			error: error,
		});
	}
}
