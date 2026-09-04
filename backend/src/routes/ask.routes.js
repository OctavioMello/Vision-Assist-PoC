import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  res.json({
    message: "Ask route working"
  });
});

export default router;