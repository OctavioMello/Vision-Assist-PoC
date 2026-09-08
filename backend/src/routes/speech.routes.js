import { Router } from "express";
import {
  transcribe,
  speak
} from "../controllers/speech.controller.js";

const router = Router();

router.post("/transcribe", transcribe);
router.post("/speak", speak);

export default router;
