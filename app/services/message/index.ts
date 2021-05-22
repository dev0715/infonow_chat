import {
	NewMessageSchema,
	UpdateMessageSchema,
	NewMessageSchemaType,
	UpdateMessageSchemaType,
} from "../../../sequelize/validation-schema";
import { SequelizeAttributes } from "../../../sequelize/types";
import { User } from "../../../sequelize/models/User";
import { Message } from "../../../sequelize/models/Message";
import { Op } from "sequelize";
import { ChatUtils } from "../chat";
import moment, { Moment } from "moment";

export class MessageUtils {
	private static async getChatMessages(
		chatId: number,
		dateTime: Moment = moment().utc()
	): Promise<Message[]> {
		let messages = await Message.findAll({
			include: [User],
			where: {
				chatId: chatId,
				createdAt: { [Op.lt]: dateTime },
			},
			limit: 50,
			order: [["messageId", "DESC"]],
		});

		return messages;
	}

	static async getChatMessagesByChatId(
		chatId: number,
		dateTime: Moment = moment().utc()
	): Promise<Message[]> {
		return await this.getChatMessages(chatId, dateTime);
	}

	static async getChatMessagesByChatUuid(
		chatId: string,
		dateTime: Moment = moment().utc()
	): Promise<Message[]> {
		let chat = await ChatUtils.getChatByUuid(
			chatId,
			SequelizeAttributes.WithIndexes
		);
		return await this.getChatMessages(chat._chatId, dateTime);
	}

	static async getMessage(
		messageId: number,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<Message | null> {
		let options = {
			include: [User],
			where: {
				messageId: messageId,
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

		return await this.getMessage(newMessage.messageId, returns);
	}

	static async updateMessage(
		message: UpdateMessageSchemaType
	): Promise<Message | any> {
		await UpdateMessageSchema.validateAsync(message);

		let updatedMessage = await Message.update(message as any, {
			where: {
				messageId: message.messageId,
			},
		});
		return await this.getMessage(message.messageId);
	}
}
