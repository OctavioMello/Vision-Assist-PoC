import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  res.json({
    message: "Analyze route working"
  });
});

export default router;