import { Router } from "express";
import { getStatus } from "../controllers/index.controller.js";

const router = Router();

router.get("/", getStatus);

export default router;