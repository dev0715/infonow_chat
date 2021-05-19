"use strict";
import { NextFunction, Request, Response } from "express";
import { DataResponse } from "../../../sequelize/utils/http-response";
import { ChatUtils } from "../../services";
import { NotFoundError } from "../../../sequelize/utils/errors";

/**@urlParams  /:userId */
export async function getAllUserChats(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const chats = await ChatUtils.getAllUserChats(req.params.userId);
		if (chats.length > 0) return DataResponse(res, 200, chats);
		throw new NotFoundError("No chat found");
	} catch (err) {
		// Handle Exception
		return next(err);
	}
}

/**@urlParams  /:chatId */
export async function getChat(req: Request, res: Response, next: NextFunction) {
	try {
		const chat = await ChatUtils.getChat(req.params.chatId);
		if (chat) return DataResponse(res, 200, chat);
		throw new NotFoundError("No chat found");
	} catch (err) {
		// Handle Exception
		return next(err);
	}
}

export async function newChat(req: Request, res: Response, next: NextFunction) {
	try {
		let newChat = req.body;
		newChat.createdBy = req.CurrentUser?.userId;

		const chat = await ChatUtils.addNewChat(newChat);
		if (chat) return DataResponse(res, 200, chat);

		throw new NotFoundError("Failed to add chat, try again");
	} catch (err) {
		// Handle Exception
		return next(err);
	}
}
