import { Server, Socket } from "socket.io";
import { ChatParticipantUtils } from "../../app/services/chat-participant";
import { MessageUtils } from "../../app/services/message";
import { Document } from "../../sequelize";
import { SequelizeAttributes } from "../../sequelize/types";
import { ValidationError } from "../../sequelize/utils/errors";
import { Logger } from "../../sequelize/utils/logger";
import { NewMessageSchemaType } from "../../sequelize/validation-schema";
import { NewChatMessage } from "../models";
import { IOEvents } from "./index";
import { getClientsInRoom } from "./utils";

async function findAndUpdateParticipants(
	io: Server,
	socket: Socket,
	chatId: string
) {
	try {
		let clients = getClientsInRoom(io, chatId);

		let connectedUsers = [];
		let activeUsers = [];

		for (let client of clients ?? []) {
			let socket = io.sockets.sockets.get(client);
			if (socket?.activeRoom) {
				if (socket.activeRoom == chatId) {
					activeUsers.push(socket.user!._userId);
				} else {
					connectedUsers.push(socket.user!._userId);
				}
			} else {
				connectedUsers.push(socket!.user!._userId);
			}
		}

		let participants =
			await ChatParticipantUtils.updateConnectedAndActiveParticipants(
				socket.roomsJoined[chatId],
				connectedUsers as number[],
				activeUsers as number[]
			);

		io.sockets.in(chatId).emit(IOEvents.MESSAGES_DELIVERED, {
			chatId: chatId,
			data: participants,
			success: true,
		});
	} catch (error) {
		Logger.error(error);
	}
}

export async function OnNewChatMessage(
	io: Server,
	socket: Socket,
	data: NewChatMessage
) {
	try {
		console.log(IOEvents.NEW_MESSAGE, data);

		if (!data.chatId || !data.message) {
			throw new ValidationError("New Message data is not complete");
		}
		if (!socket.roomsJoined[data.chatId]) {
			throw new ValidationError("No chat found");
		}
		let msg: NewMessageSchemaType = {
			chatId: socket.roomsJoined[data.chatId],
			content: data.message,
			createdBy: socket.user!._userId!,
		};
		if (data.documentId) {
			let document = await Document.findOneSafe<Document>(
				SequelizeAttributes.WithIndexes,
				{
					where: {
						documentId: data.documentId,
					},
				}
			);
			if (document) msg.documentId = document._documentId;
		}

		let newMessage = await MessageUtils.addNewMessage(msg);

		socket.emit(IOEvents.NEW_MESSAGE, {
			chatId: data.chatId,
			messageId: data.messageId,
			data: newMessage,
			success: true,
		});

		socket.to(data.chatId).emit(IOEvents.NEW_MESSAGE, {
			chatId: data.chatId,
			data: newMessage,
			success: true,
		});

		findAndUpdateParticipants(io, socket, data.chatId);
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
