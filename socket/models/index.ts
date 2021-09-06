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

export interface MessageDeleteData {
	chatId: string;
	lastMessageTime: Moment;
}

export interface BlockChatData {
	chatId: string;
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
	documentId: string;
}

export interface UpdateChatMessage {
	chatId: string;
	messageId: number;
	dateTime: Moment;
}
export interface PreviousMessageData {
	chatId: string;
	dateTime: Moment;
	lastMessageTime: Moment;
}

export interface UpdateParticipants {
	chatId: string;
	participants: [];
}

export interface MessageDelivered {
	chatId: string;
	deliveredAt: Moment;
}

export interface MessageSeen {
	chatId: string;
	deliveredAt?: Moment;
	seenAt: Moment;
}
