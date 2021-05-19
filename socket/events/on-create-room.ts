import { Server, Socket } from "socket.io";
import { SocketData, SocketOffer } from "../models";
import { Redis } from "../../redis";
import { ChatUtils } from "../../app/services";

import {
	IOEvents,
	OnJoinRoom,
	OnAnswerCall,
	OnStartCall,
	OnEndCall,
	OnCreateIceEventData,
	OnMuteAudio,
	OnUnmuteAudio,
	OnMuteVideo,
	OnUnmuteVideo,
	OnScreenSharing,
	OnVideoSharing,
} from "./index";
import { isRoomEmpty } from "./utils";

export async function OnCreateRoom(
	io: Server,
	socket: Socket,
	res: SocketData
) {
	let meetingId = res.meetingId!;

	console.log(IOEvents.CREATE_ROOM, meetingId);

	// VERIFY AND VALIDATE USER BEFORE JOIN //
	let isMeeting = await isValidMeeting(socket, meetingId);
	if (!isMeeting) {
		let message = socket.t("No meeting found");
		return socket.emit(IOEvents.ROOM_NOT_FOUND, { message: message });
	}

	// Attach Socket Events
	attachEvents(io, socket);

	// To Check If Room Exists Or Not //
	if (!isRoomEmpty(io, meetingId)) {
		let message = socket.t("meeting already exists");
		return socket.emit(IOEvents.ROOM_EXIST, { message: message });
	}

	let meetingOffer: SocketOffer = {
		userId: socket.userId!,
		offer: res.data!,
	};

	Redis.getInstance().set(meetingId, JSON.stringify(meetingOffer));

	//ATTACH MEETING ID WITH SOCKET
	socket.meetingId = meetingId;
	socket.join(meetingId);
	socket.emit(IOEvents.CALL_ON_WAIT);
}

async function isValidMeeting(
	socket: Socket,
	meetingId: string
): Promise<Boolean> {
	let meeting = await ChatUtils.getChat(meetingId);

	let validUser = meeting?.participants.find(
		(x) => x.user.userId === socket.userId!
	);

	if (meeting == null) {
		let message = socket.t("No meeting found");
		socket.emit(IOEvents.MEETING_NOT_FOUND, { message: message });
		return false;
	} else if (
		["pending", "rejected", "cancelled"].indexOf(meeting.status!) > -1
	) {
		let message = socket.t("meeting is %s", meeting.status);
		socket.emit(IOEvents.MEETING_NOT_ACTIVE, { message: message });
		return false;
	} else if (!validUser) {
		let message = socket.t("invalid participant");
		socket.emit(IOEvents.INVALID_PARTICIPANT, { message: message });
		return false;
	}

	return true;
}

function attachEvents(io: Server, socket: Socket) {
	socket.on(IOEvents.ROOM_JOIN, (res) => OnJoinRoom(io, socket, res));
	socket.on(IOEvents.ANSWER_CALL, (res) => OnAnswerCall(socket, res));
	socket.on(IOEvents.START_CALL, () => OnStartCall(socket));
	socket.on(IOEvents.END_CALL, () => OnEndCall(socket));
	socket.on(IOEvents.CREATE_ICE_EVENT_DATA, (res) =>
		OnCreateIceEventData(socket, res)
	);
	socket.on(IOEvents.MUTE_AUDIO, () => OnMuteAudio(socket));
	socket.on(IOEvents.UNMUTE_AUDIO, () => OnUnmuteAudio(socket));
	socket.on(IOEvents.MUTE_VIDEO, () => OnMuteVideo(socket));
	socket.on(IOEvents.UNMUTE_VIDEO, () => OnUnmuteVideo(socket));
	socket.on(IOEvents.VIDEO_SHARING, () => OnVideoSharing(socket));
	socket.on(IOEvents.SCREEN_SHARING, () => OnScreenSharing(socket));
}
