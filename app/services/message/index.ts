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
import { sequelize } from "../../../sequelize";
import { ChatParticipant } from "../../../sequelize/models/ChatParticipant";

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

		return messages.reverse();
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
		var transaction;
		try {
			transaction = await sequelize.transaction();
			await NewMessageSchema.validateAsync(message);

			let newMessage = await Message.create({
				...message,
				transaction: transaction,
			} as any);

			let clearParticipants = await ChatParticipant.update(
				{
					seenAt: null,
					deliveredAt: null,
				} as any,
				{
					where: {
						chatId: message.chatId,
					},
					transaction: transaction,
				}
			);

			let userUpdated = await ChatParticipant.update(
				{
					seenAt: moment().utc(),
					deliveredAt: moment().utc(),
				} as any,
				{
					where: {
						chatId: message.chatId,
						chatParticipantId: message.createdBy,
					},
					transaction: transaction,
				}
			);

			transaction.commit();
			return await this.getMessage(newMessage.messageId, returns);
		} catch (error) {
			if (transaction) transaction.rollback();

			throw error;
		}
	}
}
