import { Server, Socket } from "socket.io";
import { ChatParticipantUtils } from "../../app/services/chat-participant";
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
		console.log(IOEvents.Add_Participant);

		if (!data.chatId || !data.participants) {
			throw "Add Participants data is not complete";
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

		io.sockets.in(data.chatId).emit(IOEvents.Add_Participant, {
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
		socket.emit(IOEvents.Add_Participant, {
			chatId: data.chatId,
			success: false,
			error: error,
		});
	}
}
