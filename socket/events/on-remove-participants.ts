import { Server, Socket } from "socket.io";
import { ChatParticipantUtils } from "../../app/services/chat-participant";
import { ValidationError } from "../../sequelize/utils/errors";
import { Logger } from "../../sequelize/utils/logger";
import { NewChatParticipantSchemaType } from "../../sequelize/validation-schema";
import { UpdateParticipants } from "../models";
import { IOEvents } from "./index";

export async function OnRemoveParticipants(
	io: Server,
	socket: Socket,
	data: UpdateParticipants
) {
	try {
		console.log(IOEvents.REMOVE_PARTICIPANT);

		if (!data.chatId || !data.participants) {
			throw new ValidationError(
				"Remove Participants data is not complete"
			);
		}
		let participantData: NewChatParticipantSchemaType = {
			chatId: data.chatId,
			userId: socket.user!.userId,
			participants: data.participants,
		};

		let participants =
			await ChatParticipantUtils.removeParticipantsInChatGroup(
				participantData
			);

		io.sockets.in(data.chatId).emit(IOEvents.REMOVE_PARTICIPANT, {
			chatId: data.chatId,
			data: participants,
			success: true,
		});

		data.participants.forEach((p) => {
			io.sockets.in(p).emit(IOEvents.GLOBAL_ROOM_NOTIFICATION, {
				data: "You are added in new Chat",
				success: true,
			});
		});
	} catch (error) {
		Logger.error(error);
		socket.emit(IOEvents.REMOVE_PARTICIPANT, {
			chatId: data.chatId,
			success: false,
			error: error,
		});
	}
}
