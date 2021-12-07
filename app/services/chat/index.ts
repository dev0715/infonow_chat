import {
	NewChatSchema,
	NewChatSchemaType,
} from "../../../sequelize/validation-schema";
import { ChatSearchType, SequelizeAttributes } from "../../../sequelize/types";
import { User } from "../../../sequelize/models/User";
import {
	BadRequestError,
	NotFoundError,
} from "../../../sequelize/utils/errors";
import { Chat } from "../../../sequelize/models/Chat";
import { ChatParticipant } from "../../../sequelize/models/ChatParticipant";
import { Message } from "../../../sequelize/models/Message";

import { op as Op } from "../../../sequelize";

export class ChatUtils {
	static async getAllUserChats(
		userId: string,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<Chat[]> {
		let chatIds = await ChatParticipant.findAll({
			include: [
				{
					model: User,
					attributes:['_userId','userId','name','profilepicture','about','roleId'],
					where: {
						userId,
					},
				},
			],
			where: {
				chatParticipantStatus: 1,
			},
			attributes: ["chatId"],
		});

		let options: any = {
			subQuery: false,
			include: [
				{
				model:User,
				attributes:['_userId','userId','name','profilepicture','about','roleId'],
			},
				{
					model: ChatParticipant,
					
					include: [{
						model:User,
						attributes:['_userId','userId','name','profilepicture','about','roleId'],
					}],
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
				_chatId: { [Op.in]: chatIds.map((c) => c.chatId) },
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
		try {
			await NewChatSchema.validateAsync(chat);

			let userIds = [chat.createdBy, ...chat.participants];
			let users = await User.findAll({
				where: {
					userId: { [Op.in]: userIds },
				},
				attributes: ["_userId", "userId"],
			} as any);
			if (users.length !== userIds.length)
				throw new BadRequestError("Invalid Participant");

			let currentUser = users.find(
				(x: User) => x.userId === chat.createdBy
			);

			let participantUsers = users.filter(
				(x: User) => x.userId !== chat.createdBy
			);

			if (!currentUser) throw new NotFoundError("User not found");
			if (participantUsers.length <= 0)
				throw new NotFoundError("Participant not found");

			if (participantUsers.length != chat.participants.length)
				throw new NotFoundError("User not found");

			let participantsData: any = [
				{
					chatParticipantId: currentUser!._userId,
				},
				...participantUsers.map((p) => {
					return {
						chatParticipantId: p!._userId,
					};
				}),
			];

			let chatData = {
				type: chat.type,
				createdBy: currentUser!._userId,
				groupName: chat.groupName ?? null,
				groupPhoto: chat.groupPhoto ?? null,
				chatParticipants: participantsData,
			} as any;

						

			if (chat.type == "chat") {
				let exChat = (await Chat.findOrCreateSafe(
					SequelizeAttributes.WithIndexes,
					{
						defaults: chatData,
						include: [
							User,
							{
								model: ChatParticipant,
								where: {
									chatParticipantId: {
										[Op.in]: [
											...participantUsers!.map((u) => u!._userId!),
										]										
									}
								},
							},
						],
						where: {
							type: "chat",
						},
					} as any
				)) as any;

				if (exChat.length > 0)
					return this.getChatById(exChat[0]._chatId, returns);
			}

			let groupChat = await Chat.create(chatData as any, {
				include: [ChatParticipant],
			});

			return this.getChatById(groupChat._chatId, returns);
		} catch (error) {
			throw error;
		}
	}
}
