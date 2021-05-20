import {
	NewChatSchema,
	NewChatSchemaType,
} from "../../../sequelize/validation-schema";
import { SequelizeAttributes } from "../../../sequelize/types";
import { User } from "../../../sequelize/models/User";
import { NotFoundError } from "../../../sequelize/utils/errors";
import { sequelize } from "../../../sequelize";
import { Chat } from "../../../sequelize/models/Chat";
import { ChatParticipant } from "../../../sequelize/models/ChatParticipant";

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

		let options = {
			include: [
				{
					model: ChatParticipant,
					include: [User],
				},
				User,
			],
			where: {
				_chatId: chatIds.map((c) => c.chatId),
			},
		};
		let chats = await Chat.findAllSafe<Chat[]>(returns, options);
		return chats;
	}

	static async getChat(
		chatId: string | number,
		returns: SequelizeAttributes = SequelizeAttributes.WithoutIndexes
	): Promise<Chat> {
		let chatIdType = typeof chatId === "number" ? "_chatId" : "chatId";

		let options = {
			include: [
				{
					model: ChatParticipant,
					include: [User],
				},
				User,
			],
			where: {
				[chatIdType]: chatId,
			},
		};

		let chat = await Chat.findOneSafe<Chat>(returns, options);
		return chat;
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
					userId: [chat.createdBy, chat.participant],
				},
			});

			let currentUser = users.find(
				(x: User) => x.userId === chat.createdBy
			);
			let participantUser = users.find(
				(x: User) => x.userId === chat.participant
			);

			if (!currentUser) throw new NotFoundError("User not found");
			if (!participantUser)
				throw new NotFoundError("Participant not found");

			let newChat = await Chat.create({
				...chat,
				createdBy: currentUser!._userId,
				transaction,
			} as any);

			let participantsData: any = [
				{
					chatId: newChat._chatId,
					chatParticipantId: currentUser!._userId,
				},
				{
					chatId: newChat._chatId,
					chatParticipantId: participantUser?._userId,
				},
			];

			let participants = await ChatParticipant.bulkCreate(
				participantsData,
				{
					transaction,
				}
			);

			await transaction.commit();

			return this.getChat(newChat._chatId, returns);
		} catch (error) {
			if (transaction) await transaction.rollback();
			throw error;
		}
	}
}
