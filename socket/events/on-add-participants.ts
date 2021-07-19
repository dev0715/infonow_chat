import { Server, Socket } from "socket.io";
import { ChatParticipantUtils } from "../../app/services/chat-participant";
import { ValidationError } from "../../sequelize/utils/errors";
import { Logger } from "../../sequelize/utils/logger";
import { NewChatParticipantSchemaType } from "../../sequelize/validation-schema";
import { NewParticipant } from "../models";
import { IOEvents } from "./index";

export async function OnAddParticipants(
	io: Server,
	socket: Socket,
	data: NewParticipant
) {
	try {
		console.log(IOEvents.ADD_PARTICIPANT);

		if (!data.chatId || !data.participants) {
			throw new ValidationError("Add Participants data is not complete");
		}
		let participantData: NewChatParticipantSchemaType = {
			chatId: data.chatId,
			userId: socket.user!.userId,
			participants: data.participants,
		};

		let participants =
			await ChatParticipantUtils.addParticipantsInChatGroup(
				participantData
			);

		io.sockets.in(data.chatId).emit(IOEvents.ADD_PARTICIPANT, {
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
		socket.emit(IOEvents.ADD_PARTICIPANT, {
			chatId: data.chatId,
			success: false,
			error: error,
		});
	}
}
