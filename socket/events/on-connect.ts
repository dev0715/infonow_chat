import { Server, Socket } from "socket.io";
import { IOEvents } from ".";
import { t } from "../../sequelize/locales";
import { SocketData } from "../models";
import { OnAuthorization } from "./on-authorization";
import { OnEndCall } from "./on-end-call";

function OnLocaleSet(socket: Socket, data: SocketData = { locale:"en" }) {
    socket.locale = data.locale ?? "en";
    socket.t = (message: string, ...args: any) => {
        // t.setLocale(socket.locale);
        // return t.__(message, ...args);
        return message
    };
}

export function OnConnect(io: Server, socket: Socket) {

    console.log("New User Connected");
    OnLocaleSet(socket);

    socket.on(IOEvents.AUTHORIZATION, data=> OnAuthorization(io, socket, data));
    socket.on(IOEvents.SET_LANGUAGE, data=> OnLocaleSet(socket, data));
    socket.on(IOEvents.DISCONNECT, () => OnEndCall(socket));

    socket.emit(IOEvents.CONNECT);
}