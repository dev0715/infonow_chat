import express, { Request } from "express";
const router = express.Router();

import { ChatsCtrl } from "../../controllers";
import { UUID_REGEX_ROUTE } from "../../../sequelize/utils/validators";
import { ImageFileUploadMulter } from "../../../sequelize/middlewares/files";

router.get(`/:chatId(${UUID_REGEX_ROUTE})`, ChatsCtrl.getChat);
router.post(
	"/",
	(req, res, next) => ImageFileUploadMulter(req, res, next, "file"),
	ChatsCtrl.newChat
);

router.post(`/add-participants`, ChatsCtrl.addParticipants);

export default router;
