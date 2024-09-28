import { Router } from "express";
import { getUser, login, register } from "../controllers/user/index.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.get("/get", authMiddleware, getUser);
router.post("/register", register);

export default router;
