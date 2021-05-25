export * from "./on-connect";
export * from "./on-disconnect";
export * from "./on-authorization";
export * from "./on-set-language";
export * from "./on-join-room";
export * from "./on-join-global-room";
export * from "./on-new-chat-message";
export * from "./on-get-previous-messages";
export * from "./on-add-participants";

export const IOEvents = {
	CONNECT: "CONNECT",
	DISCONNECT: "disconnect",
	AUTHORIZATION: "AUTHORIZATION",
	SET_LANGUAGE: "SET_LANGUAGE",
	NEW_MESSAGE: "NEW_MESSAGE",
	UPDATE_MESSAGE: "UPDATE_MESSAGE",
	Add_Participant: "Add_Participant",
	GET_PREVIOUS_MESSAGES: "GET_PREVIOUS_MESSAGES",
	JOIN_ROOM: "JOIN_ROOM",
	JOIN_GLOBAL_ROOM: "JOIN_GLOBAL_ROOM",
	GLOBAL_ROOM_NOTIFICATION: "GLOBAL_ROOM_NOTIFICATION",
	MESSAGES_DELIVERED: "MESSAGES_DELIVERED",
	MESSAGES_SEEN: "MESSAGES_SEEN",
};
