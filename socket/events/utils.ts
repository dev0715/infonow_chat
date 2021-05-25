import { Server } from "socket.io";

export function getClientsInRoom(io: Server, roomId: string) {
	let clients = io.sockets.adapter.rooms.get(roomId);
	return clients;
}

export function isUserJoined(io: Server, roomId: string, userId: string) {
	let clients = getClientsInRoom(io, roomId);
	for (let client of clients ?? []) {
		let socket = io.sockets.sockets.get(client);
		console.log("SOCKET_USERID", socket!.userId);
		if (socket?.userId === userId) return true;
	}
	return false;
}

export function isRoomEmpty(io: Server, roomId: string) {
	return (getClientsInRoom(io, roomId)?.size ?? 0) === 0;
}
