import {
	NewChatSchema,
	NewChatSchemaType,
} from "../../../sequelize/validation-schema";
import { ChatSearchType, SequelizeAttributes } from "../../../sequelize/types";
import { User } from "../../../sequelize/models/User";
import { NotFoundError } from "../../../sequelize/utils/errors";
import { sequelize } from "../../../sequelize";
import { Chat } from "../../../sequelize/models/Chat";
import { ChatParticipant } from "../../../sequelize/models/ChatParticipant";
import { Message } from "../../../sequelize/models/Message";

export class ChatUtils {
	static async getAllUserChats(
		userId: string,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<Chat[]> {
		let chatIds = await ChatParticipant.findAll({
			include: [
				{
					model: User,
					where: {
						userId,
					},
				},
			],
			attributes: ["chatId"],
		});

		let options: any = {
			subQuery: false,
			include: [
				User,
				{
					model: ChatParticipant,
					include: [User],
				},
				{
					model: Message,
					include: [User],
					order: [["messageId", "DESC"]],
					limit: 1,
					separate: true,
				},
			],
			where: {
				_chatId: chatIds.map((c) => c.chatId),
			},
		};
		//	let chats: Chat[] = await Chat.findAllSafe(returns, options);
		let chats: Chat[] = await Chat.findAll(options);
		return chats;
	}

	static async getChat(
		type: ChatSearchType,
		key: any,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<Chat> {
		let chat = await Chat.findOneSafe<Chat>(returns, {
			include: [
				User,
				{
					model: ChatParticipant,
					include: [User],
				},
				{
					model: Message,
					include: [User],
					order: [["messageId", "DESC"]],
					limit: 1,
					separate: true,
				},
			],
			where: { [type]: key },
		});
		return chat;
	}

	static async getChatByUuid(
		chatId: string,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<Chat> {
		return await this.getChat("chatId", chatId, returns);
	}

	static async getChatById(
		chatId: number,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<Chat> {
		return await this.getChat("_chatId", chatId, returns);
	}

	static async addNewChat(
		chat: NewChatSchemaType,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<Chat | null> {
		var transaction;
		try {
			transaction = await sequelize.transaction();
			await NewChatSchema.validateAsync(chat);

			let users = await User.findAll({
				where: {
					userId: [chat.createdBy, ...chat.participants],
				},
			});

			let currentUser = users.find(
				(x: User) => x.userId === chat.createdBy
			);

			let participantUsers = users.filter(
				(x: User) => x.userId !== chat.createdBy
			);

			if (!currentUser) throw new NotFoundError("User not found");
			if (!participantUsers)
				throw new NotFoundError("Participant not found");

			console.log("GROUP_NAME", chat);

			let newChat = await Chat.create({
				type: chat.type,
				createdBy: currentUser!._userId,
				groupName: chat.groupName ?? null,
				transaction,
			} as any);

			let participantsData: any = [
				{
					chatId: newChat._chatId,
					chatParticipantId: currentUser!._userId,
				},
				...participantUsers.map((p) => {
					return {
						chatId: newChat._chatId,
						chatParticipantId: p!._userId,
					};
				}),
			];

			let addedParticipants = await ChatParticipant.bulkCreate(
				participantsData,
				{
					transaction,
				}
			);

			await transaction.commit();

			return this.getChatById(newChat._chatId, returns);
		} catch (error) {
			if (transaction) await transaction.rollback();
			throw error;
		}
	}
}
