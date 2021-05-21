import { Socket } from "socket.io";
import { MessageUtils } from "../../app/services/message";
import { Logger } from "../../sequelize/utils/logger";
import { NewMessageSchemaType } from "../../sequelize/validation-schema";
import { NewChatMessage } from "../models";
import { IOEvents } from "./index";

export async function OnNewChatMessage(socket: Socket, data: NewChatMessage) {
	try {
		console.log(IOEvents.NEW_MESSAGE);

		if (!data.chatId || !data.messageId || !data.message) {
			throw "New Message data is not complete";
		}
		let msg: NewMessageSchemaType = {
			chatId: socket.roomsJoined[data.chatId],
			content: data.message,
			createdBy: socket.user!._userId!,
		};

		let newMessage = await MessageUtils.addNewMessage(msg);

		socket.emit(IOEvents.NEW_MESSAGE, {
			messageId: data.messageId,
			data: newMessage,
			success: true,
		});
	} catch (error) {
		Logger.error(error);
		socket.emit(IOEvents.NEW_MESSAGE, {
			messageId: data.messageId,
			success: false,
			error: error,
		});
	}
}
