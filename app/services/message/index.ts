import {
	NewMessageSchema,
	UpdateMessageSchema,
	NewMessageSchemaType,
	UpdateMessageSchemaType,
} from "../../../sequelize/validation-schema";
import { SequelizeAttributes } from "../../../sequelize/types";
import { User } from "../../../sequelize/models/User";
import { ChatParticipant } from "../../../sequelize/models/ChatParticipant";
import { Message } from "../../../sequelize/models/Message";
import { Chat } from "../../../sequelize/models/Chat";
import { Op } from "sequelize";
import { ChatUtils } from "../chat";

export class MessageUtils {
	private static async getChatMessages(
		chatId: number,
		lastMessageId: number = 0
	): Promise<Message[]> {
		let messages = await Message.findAll({
			include: [User],
			where: {
				chatId: chatId,
				messageId: { [Op.gt]: lastMessageId },
			},
			limit: 50,
			order: [["messageId", "DESC"]],
		});

		return messages;
	}

	static async getChatMessagesByChatId(
		chatId: number,
		lastMessageId: number = 0
	): Promise<Message[]> {
		return await this.getChatMessages(chatId, lastMessageId);
	}

	static async getChatMessagesByChatUuid(
		chatId: string,
		lastMessageId: number = 0
	): Promise<Message[]> {
		let chat = await ChatUtils.getChatByUuid(
			chatId,
			SequelizeAttributes.WithIndexes
		);
		return await this.getChatMessages(chat._chatId, lastMessageId);
	}

	static async getMessage(
		messageId: string | number,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<Message | null> {
		let messageIdType =
			typeof messageId === "number" ? "_messageId" : "messageId";

		let options = {
			include: [
				{
					model: ChatParticipant,
					include: [User],
				},
				User,
			],
			where: {
				[messageIdType]: messageId,
			},
		};

		let message = await Message.findOneSafe<Message>(returns, options);
		return message;
	}

	static async addNewMessage(
		message: NewMessageSchemaType,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<Message | null> {
		await NewMessageSchema.validateAsync(message);

		let newMessage = await Message.create({
			...message,
		} as any);

		return this.getMessage(newMessage.messageId, returns);
	}

	private static async updateMessage(
		message: UpdateMessageSchemaType
	): Promise<Message | any> {
		await UpdateMessageSchema.validateAsync(message);

		let updatedMessage = await Message.update(message as any, {
			where: {
				messageId: message.messageId,
			},
		});
		return this.getMessage(message.messageId);
	}
}
