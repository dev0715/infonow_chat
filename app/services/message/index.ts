import {
	NewMessageSchema,
	NewMessageSchemaType,
} from "../../../sequelize/validation-schema";
import { SequelizeAttributes } from "../../../sequelize/types";
import { User } from "../../../sequelize/models/User";
import { Message } from "../../../sequelize/models/Message";
import { op as Op } from "../../../sequelize";
import { ChatUtils } from "../chat";
import moment, { Moment } from "moment";
import { Document, sequelize } from "../../../sequelize";
import { ChatParticipant } from "../../../sequelize/models/ChatParticipant";
import { ValidationError } from "../../../sequelize/utils/errors";
import { Logger } from "../../../sequelize/utils/logger";

export class MessageUtils {
	/**
	 *
	 * @param {number} chatId
	 * @param {Moment} dateTime
	 * @param {Moment} lastMessageTime
	 * @param {Moment} blockedAt
	 * @returns
	 */
	private static async getChatMessages(
		chatId: number,
		dateTime: Moment = moment().utc(),
		lastMessageTime: string,
		blockedAt: Moment = moment().utc()
	): Promise<Message[]> {
		lastMessageTime = lastMessageTime
			? lastMessageTime
			: "2000-02-02 12:00:00";
		let messages = await Message.findAll({
			include: [User, Document],
			where: {
				chatId: chatId,
				createdAt: {
					[Op.and]: [
						{ [Op.lt]: dateTime },
						{ [Op.gt]: lastMessageTime },
						{ [Op.lt]: blockedAt },
					],
				},
			},
			limit: 25,
			order: [["messageId", "DESC"]],
		} as any);

		return messages.reverse();
	}

	/**
	 * @param {Number}userId
	 * @param {Number}chatId
	 * @param {Moment}dateTime
	 * @param {Moment}lastMessageTime
	 * @returns Message[]
	 */
	static async getChatMessagesByChatId(
		userId: number,
		chatId: number,
		dateTime: Moment = moment().utc()
	): Promise<Message[]> {
		let chat = await ChatUtils.getChatById(
			chatId,
			SequelizeAttributes.WithIndexes
		);
		let user = chat.chatParticipants.find((x) => x.user._userId === userId);

		if (!user) {
			throw new ValidationError("invalid participant");
		}

		return await this.getChatMessages(
			chatId,
			dateTime,
			user.lastMessageTime as any,
			user.blockedAt ? moment(user.blockedAt) : moment().utc()
		);
	}

	static async getChatMessagesByChatUuid(
		userId: string,
		chatId: string,
		dateTime: Moment = moment().utc()
	): Promise<Message[]> {
		let chat = await ChatUtils.getChatByUuid(
			chatId,
			SequelizeAttributes.WithIndexes
		);
		let user = chat.chatParticipants.find((x) => x.user.userId === userId);

		if (!user) {
			throw new ValidationError("invalid participant");
		}

		return await this.getChatMessages(
			chat._chatId,
			dateTime,
			user.lastMessageTime as any,
			user.blockedAt ? moment(user.blockedAt) : moment().utc()
		);
	}

	static async getMessage(
		messageId: number,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<Message | null> {
		let options = {
			include: [User, Document],
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
