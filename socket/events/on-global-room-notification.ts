import { Socket } from "socket.io";
import { Logger } from "../../sequelize/utils/logger";
import { GlobalRoomNotification } from "../models";
import { IOEvents } from "./index";

export function OnGlobalRoomNotification(
	socket: Socket,
	data: GlobalRoomNotification
) {
	try {
		console.log(IOEvents.GLOBAL_ROOM_NOTIFICATION);
		if (!data.userId || !data.content || !data.notificationId) {
			throw "userId or content is missing in Global Notification";
		}
		socket.to(data.userId).emit(IOEvents.GLOBAL_ROOM_NOTIFICATION, {
			data: data.content,
			success: true,
		});
		socket.emit(IOEvents.GLOBAL_ROOM_NOTIFICATION_RESPONSE, {
			notificationId: data.notificationId,
			data: data.content,
			success: true,
		});
	} catch (error) {
		Logger.error(error);
		socket.emit(IOEvents.GLOBAL_ROOM_NOTIFICATION_RESPONSE, {
			notificationId: data.notificationId,
			success: false,
			error: error,
		});
	}
}
