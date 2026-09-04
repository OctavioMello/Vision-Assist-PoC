import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Vision Assist AI Backend is running"
  });
});

export default router;