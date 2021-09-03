import express from "express";
import { ChatsCtrl } from "../../controllers";

import { UUID_REGEX_ROUTE } from "../../../sequelize/utils/validators";
import { AuthorizeUtil } from "../../../sequelize/middlewares/auth/auth";
const router = express.Router();

router.get(
	`/:userId(${UUID_REGEX_ROUTE})/chats`,
	AuthorizeUtil.AuthorizeAdminOrSelf,
	ChatsCtrl.getAllUserChats
);

export default router;
