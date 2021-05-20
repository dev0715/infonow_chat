import { Socket } from "socket.io";
import { IOEvents } from ".";
import { SocketData } from "../models";

export function OnSetLanguage(
	socket: Socket,
	data: SocketData = { locale: "en" }
) {
	console.log(IOEvents.SET_LANGUAGE);
	socket.locale = data.locale ?? "en";
	socket.t = (message: string, ...args: any) => {
		return message;
	};
}
