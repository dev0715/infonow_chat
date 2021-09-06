export * from "./on-connect";
export * from "./on-disconnect";
export * from "./on-authorization";
export * from "./on-set-language";
export * from "./on-join-room";
export * from "./on-join-global-room";
export * from "./on-new-chat-message";
export * from "./on-get-previous-messages";
export * from "./on-add-participants";
export * from "./on-remove-participants";
export * from "./on-messages-delete";
export * from "./on-block-chat";
export * from "./on-unblock-chat";

export const IOEvents = {
	CONNECT: "CONNECT",
	DISCONNECT: "disconnect",
	AUTHORIZATION: "AUTHORIZATION",
	SET_LANGUAGE: "SET_LANGUAGE",
	NEW_MESSAGE: "NEW_MESSAGE",
	UPDATE_MESSAGE: "UPDATE_MESSAGE",
	ADD_PARTICIPANT: "ADD_PARTICIPANT",
	REMOVE_PARTICIPANT: "REMOVE_PARTICIPANT",
	GET_PREVIOUS_MESSAGES: "GET_PREVIOUS_MESSAGES",
	JOIN_ROOM: "JOIN_ROOM",
	LEAVE_ROOM: "LEAVE_ROOM",
	JOIN_GLOBAL_ROOM: "JOIN_GLOBAL_ROOM",
	GLOBAL_ROOM_NOTIFICATION: "GLOBAL_ROOM_NOTIFICATION",
	MESSAGES_DELIVERED: "MESSAGES_DELIVERED",
	MESSAGES_SEEN: "MESSAGES_SEEN",
	MESSAGES_DELETE: "MESSAGES_DELETE",
	BLOCK_CHAT: "BLOCK_CHAT",
	UNBLOCK_CHAT: "UNBLOCK_CHAT",
};
