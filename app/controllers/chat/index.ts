"use strict";
import { NextFunction, Request, Response } from "express";
import { DataResponse } from "../../../sequelize/utils/http-response";
import { ChatUtils } from "../../services";
import {
	BadRequestError,
	NotFoundError,
} from "../../../sequelize/utils/errors";
import fs from "fs";
import { v4 } from "uuid";
import { Configurations } from "../../../configs/config-main";
import { ChatParticipantUtils } from "../../services/chat-participant";
import {
	NewChatParticipantSchemaType,
	NewChatSchemaType,
} from "../../../sequelize/validation-schema";

const chatAvatar = Configurations.constants.chatAvatarUpload;

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
		const chat = await ChatUtils.getChatByUuid(req.params.chatId);
		if (chat) return DataResponse(res, 200, chat);
		throw new NotFoundError("No chat found");
	} catch (err) {
		// Handle Exception
		return next(err);
	}
}

export async function newChat(req: Request, res: Response, next: NextFunction) {
	try {
		let newChat = {
			...req.body,
			createdBy: req.CurrentUser?.userId,
			role: req.CurrentUser?.roleId,
		} as NewChatSchemaType;

		const chat = await ChatUtils.addNewChat(newChat);
		if (chat) return DataResponse(res, 200, chat);

		throw new NotFoundError("Failed to add chat, try again");
	} catch (err) {
		// Handle Exception
		return next(err);
	}
}

export async function addParticipants(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		let participantData: NewChatParticipantSchemaType = {
			...req.body,
			userId: req.CurrentUser?.userId,
		};

		const participants =
			await ChatParticipantUtils.addParticipantsInChatGroup(
				participantData
			);
		if (participants.length > 0)
			return DataResponse(res, 200, participants);
		throw new NotFoundError("Failed to add participants, try again");
	} catch (err) {
		// Handle Exception
		return next(err);
	}
}
