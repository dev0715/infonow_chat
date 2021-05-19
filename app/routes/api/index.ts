import express from "express";
import UserRouter from "./user";
import ChatsRouter from "./chat";
import { AuthorizeUtil } from "../../../sequelize/middlewares/auth/auth";

const router = express.Router();

router.use("/users", AuthorizeUtil.AuthorizeUser, UserRouter);
router.use("/chats", AuthorizeUtil.AuthorizeUser, ChatsRouter);

export default router;
