import express from "express";
const router = express.Router();

import { ChatsCtrl } from "../../controllers";
import { UUID_REGEX_ROUTE } from "../../../sequelize/utils/validators";

router.get(`/:chatId(${UUID_REGEX_ROUTE})`, ChatsCtrl.getChat);
router.post("/", ChatsCtrl.newChat);

router.post(`/add-participants`, ChatsCtrl.addParticipants);

export default router;
