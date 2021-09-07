import { SequelizeAttributes } from "../../../sequelize/types";
import { User } from "../../../sequelize/models/User";
import { ChatParticipant } from "../../../sequelize/models/ChatParticipant";
import { ChatUtils } from "../chat";
import { sequelize } from "../../../sequelize";
import {
	NewChatParticipantSchemaType,
	NewChatParticipantSchema,
	ChatParticipantMessagesDeliveredSchemaType,
	ChatParticipantMessagesSeenSchemaType,
} from "../../../sequelize/validation-schema";
import { BadRequestError } from "../../../sequelize/utils/errors";

import { op as Op } from "../../../sequelize";
import moment, { Moment } from "moment";
import { Message } from "../../../sequelize/models/Message";
import { MessageUtils } from "../message";
import { Chat } from "../../../sequelize/models/Chat";

export class ChatParticipantUtils {
	static async getAllChatParticipants(
		_chatId: number,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<ChatParticipant[]> {
		let participants = await ChatParticipant.findAllSafe<ChatParticipant[]>(
			returns,
			{
				include: [User],
				where: { chatId: _chatId },
			}
		);

		return participants;
	}

	static async getParticipantsByChatUuid(
		chatId: string,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<ChatParticipant[]> {
		let chat = await ChatUtils.getChatByUuid(
			chatId,
			SequelizeAttributes.WithIndexes
		);

		return await this.getAllChatParticipants(chat._chatId, returns);
	}

	static async getParticipantsByChatId(
		chatId: number,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<ChatParticipant[]> {
		return await this.getAllChatParticipants(chatId, returns);
	}

	static async addParticipantsInChatGroup(
		data: NewChatParticipantSchemaType,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<ChatParticipant[]> {
		var transaction;
		try {
			transaction = await sequelize.transaction();
			await NewChatParticipantSchema.validateAsync(data);
			let chat = await ChatUtils.getChatByUuid(
				data.chatId,
				SequelizeAttributes.WithIndexes
			);

			if (chat.user.userId !== data.userId || chat.type !== "group") {
				throw new BadRequestError(
					"You are not authorized to this operation"
				);
			}

			let users = await User.findAllSafe<User[]>(
				SequelizeAttributes.WithIndexes,
				{
					where: {
						userId: { [Op.in]: data.participants },
					},
				} as any
			);

			if (users.length !== data.participants.length) {
				throw new BadRequestError("Invalid Participant");
			}

			let newParticipants = [];
			let existingParticipant = [];
			for (const u of users) {
				let chatUser = chat.chatParticipants.find(
					(p) => p.user.userId == u.userId
				);
				if (chatUser && !chatUser.chatParticipantStatus) {
					existingParticipant.push(u);
				} else if (!chatUser) {
					newParticipants.push(u);
				} else {
					throw new BadRequestError(
						"Duplicate participant not allowed"
					);
				}
			}

			let newParticipantsData: any = newParticipants.map((p) => {
				return {
					chatId: chat._chatId,
					chatParticipantId: p!._userId,
				};
			});
			if (existingParticipant.length)
				await ChatParticipant.update(
					{
						chatParticipantStatus: 1,
					} as any,
					{
						where: {
							chatId: chat._chatId,
							chatParticipantId: {
								[Op.in]: existingParticipant.map(
									(p) => p._userId
								),
							},
						},
						transaction: transaction,
					} as any
				);
			if (newParticipants.length)
				await ChatParticipant.bulkCreate(newParticipantsData, {
					transaction: transaction,
				});

			transaction.commit();
			return this.getParticipantsByChatId(chat._chatId, returns);
		} catch (error) {
			if (transaction) transaction.rollback();
			throw error;
		}
	}

	static async removeParticipantsInChatGroup(
		data: NewChatParticipantSchemaType,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<ChatParticipant[]> {
		try {
			await NewChatParticipantSchema.validateAsync(data);
			let chat = await ChatUtils.getChatByUuid(
				data.chatId,
				SequelizeAttributes.WithIndexes
			);

			if (chat.user.userId !== data.userId || chat.type !== "group") {
				throw new BadRequestError(
					"You are not authorized to this operation"
				);
			}

			let users = await User.findAllSafe<User[]>(
				SequelizeAttributes.WithIndexes,
				{
					where: {
						userId: { [Op.in]: data.participants },
					},
				} as any
			);

			if (users.length !== data.participants.length) {
				throw new BadRequestError("Invalid Participant");
			}

			await ChatParticipant.update(
				{
					chatParticipantStatus: 0,
				} as any,
				{
					where: {
						chatId: chat._chatId,
						chatParticipantId: {
							[Op.in]: users.map((u) => u._userId),
						},
					},
				} as any
			);

			return this.getParticipantsByChatId(chat._chatId, returns);
		} catch (error) {
			throw error;
		}
	}

	static async setParticipantMessagesDelivered(
		data: ChatParticipantMessagesDeliveredSchemaType,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<ChatParticipant[]> {
		await ChatParticipant.update(data as any, {
			where: {
				chatId: data.chatId,
				chatParticipantId: data.chatParticipantId,
				deliveredAt: null,
				blockedAt: null,
			},
		});

		return await this.getAllChatParticipants(data.chatId, returns);
	}

	static async setParticipantMessagesSeen(
		data: ChatParticipantMessagesSeenSchemaType,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<ChatParticipant[]> {
		await ChatParticipant.update(data as any, {
			where: {
				chatId: data.chatId,
				chatParticipantId: data.chatParticipantId,
				seenAt: null,
				blockedAt: null,
			},
		});
		return await this.getAllChatParticipants(data.chatId, returns);
	}

	static async updateConnectedAndActiveParticipants(
		chatId: number,
		connectedUsers: number[],
		activeUsers: number[],
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<ChatParticipant[]> {
		var transaction;
		try {
			transaction = await sequelize.transaction();
			await ChatParticipant.update(
				{
					deliveredAt: moment().utc(),
					seenAt: null,
				} as any,
				{
					where: {
						chatId: chatId,
						chatParticipantId: { [Op.in]: connectedUsers },
						blockedAt: null,
					},
					transaction: transaction,
				} as any
			);

			await ChatParticipant.update(
				{
					deliveredAt: moment().utc(),
					seenAt: moment().utc(),
				} as any,
				{
					where: {
						chatId: chatId,
						chatParticipantId: { [Op.in]: activeUsers },
						blockedAt: null,
					},
					transaction: transaction,
				} as any
			);
			transaction.commit();
			return await this.getParticipantsByChatId(chatId, returns);
		} catch (error) {
			if (transaction) transaction.rollback();
			throw error;
		}
	}

	/**
	 *
	 * @param {Number} chatId
	 * @param {Number}participantId
	 * @param {Moment} dateTime
	 * @param {Moment}lastMessageTime
	 * @param {SequelizeAttributes} returns
	 * @returns Messages[]
	 */
	static async deleteParticipantChat(
		chatId: number,
		participantId: number,
		lastMessageTime: Moment = moment(0).utc(),
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<Message[]> {
		await ChatParticipant.update(
			{
				lastMessageTime: lastMessageTime,
			} as any,
			{
				where: {
					chatId: chatId,
					chatParticipantId: participantId,
				},
			}
		);

		return await MessageUtils.getChatMessagesByChatId(
			participantId,
			chatId
		);
	}

	/**
	 *
	 * @param {Number} chatId
	 * @param {Number}participantId
	 * @returns ChatParticipant[]
	 */
	static async blockParticipantChat(
		chatId: number,
		participantId: number
	): Promise<ChatParticipant[]> {
		await ChatParticipant.update(
			{
				blockedAt: moment().utc(),
			} as any,
			{
				where: {
					chatId: chatId,
					chatParticipantId: participantId,
				},
			}
		);

		return await this.getParticipantsByChatId(chatId);
	}

	/**
	 *
	 * @param {number} chatId
	 * @param {number}participantId
	 * @returns ChatParticipant[]
	 */
	static async unBlockParticipantChat(
		chatId: number,
		participantId: number
	): Promise<ChatParticipant[]> {
		await ChatParticipant.update(
			{
				blockedAt: null,
			} as any,
			{
				where: {
					chatId: chatId,
					chatParticipantId: participantId,
				},
			}
		);

		return await this.getParticipantsByChatId(chatId);
	}
}
