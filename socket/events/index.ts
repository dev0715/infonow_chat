export * from "./on-connect";
export * from "./on-disconnect";
export * from "./on-authorization";
export * from "./on-set-language";
export * from "./on-join-room";
export * from "./on-join-global-room";
export * from "./on-new-chat-message";
export * from "./on-get-previous-messages";
export * from "./on-global-room-notification";

export const IOEvents = {
	CONNECT: "CONNECT",
	DISCONNECT: "disconnect",
	AUTHORIZATION: "AUTHORIZATION",
	SET_LANGUAGE: "SET_LANGUAGE",
	NEW_CHAT_MESSAGE: "NEW_CHAT_MESSAGE",
	GET_PREVIOUS_MESSAGES: "GET_PREVIOUS_MESSAGES",
	JOIN_ROOM: "JOIN_ROOM",
	JOIN_GLOBAL_ROOM: "JOIN_GLOBAL_ROOM",
	GLOBAL_ROOM_NOTIFICATION: "GLOBAL_ROOM_NOTIFICATION",
	GLOBAL_ROOM_NOTIFICATION_RESPONSE: "GLOBAL_ROOM_NOTIFICATION_RESPONSE",
};
