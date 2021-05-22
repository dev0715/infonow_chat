import { Moment } from "moment";
import { Message } from "../../sequelize/models/Message";

export interface SocketData {
	token?: string | null;
	userId?: string | null;
	locale?: string | null;
	type?: string | null;
	meetingId?: string;
	data?: {} | null;
	[key: string]: any;
}

export interface SocketRoom {
	chatId: string;
}

export interface GlobalRoomNotification {
	userId: string | null;
	notificationId: string | null;
	content: string | {} | null;
}

export interface NewChatMessage {
	chatId: string;
	messageId: number;
	message: string;
}

export interface UpdateChatMessage {
	chatId: string;
	messageId: number;
	dateTime: Moment;
}
export interface PreviousMessageData {
	chatId: string;
	dateTime: Moment;
}
