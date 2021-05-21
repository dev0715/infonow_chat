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
	messageId: string;
	message: Message | any;
}

export interface PreviousMessageData {
	chatId: string;
	lastMessageId: number;
}
