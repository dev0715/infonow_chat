import { SequelizeAttributes } from "../../../sequelize/types";
import { User } from "../../../sequelize/models/User";
import { ChatParticipant } from "../../../sequelize/models/ChatParticipant";
import { ChatUtils } from "../chat";
import { sequelize } from "../../../sequelize";
import {
	NewChatParticipantSchemaType,
	NewChatParticipantSchema,
} from "../../../sequelize/validation-schema";
import { BadRequestError } from "../../../sequelize/utils/errors";

export class ChatParticipantUtils {
	static async getAllChatParticipants(
		_chatId: number,
		returns: SequelizeAttributes
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

	static async addParticipantInChatGroup(
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

			if (chat.user.userId !== data.userId) {
				throw new BadRequestError(
					"You are not authorized to this operation"
				);
			}

			let users = await User.findAll({
				where: {
					userId: data.participants,
				},
			});

			let participantsData: any = users.map((p) => {
				return {
					chatId: chat._chatId,
					chatParticipantId: p!._userId,
				};
			});

			let addedParticipants = await ChatParticipant.bulkCreate(
				participantsData,
				{
					transaction,
				}
			);

			await transaction.commit();

			return this.getParticipantsByChatId(chat._chatId, returns);
		} catch (error) {
			if (transaction) transaction.rollback();
			throw error;
		}
	}
}
