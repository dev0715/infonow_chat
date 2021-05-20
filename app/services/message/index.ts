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

export class MessageUtils {
	static async getChatMessages(
		chatId: string | number,
		lastMessageId: string | null = null,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<Message[]> {
		if (typeof chatId === "string") {
			let chat = await Chat.findOne({
				where: {
					chatId: chatId,
				},
			});
			chatId = chat!._chatId;
		}

		let options = {
			include: [User],

			where: {
				chatId: chatId,
			},
		};
		let messages = await Message.findAllSafe<Message[]>(returns, options);
		return messages;
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

		return this.getMessage(newMessage._messageId, returns);
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
