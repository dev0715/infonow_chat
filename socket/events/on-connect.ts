import { Socket } from "socket.io";
import { IOEvents } from ".";
import { OnAuthorization, OnDisconnect } from ".";
import { OnSetLanguage } from ".";

export function OnConnect(socket: Socket) {
	console.log("New User Connected");

	OnSetLanguage(socket);

	socket.on(IOEvents.AUTHORIZATION, (data) => OnAuthorization(socket, data));
	socket.on(IOEvents.SET_LANGUAGE, (data) => OnSetLanguage(socket, data));
	socket.on(IOEvents.DISCONNECT, () => OnDisconnect(socket));

	socket.emit(IOEvents.CONNECT);
}
