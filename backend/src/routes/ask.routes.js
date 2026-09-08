import { Router } from "express";
import { ask } from "../controllers/ask.controller.js";

const router = Router();

router.post("/", ask);

export default router;