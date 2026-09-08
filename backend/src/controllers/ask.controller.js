import { askQuestion } from "../services/ask.service.js";

export const ask = (req, res) => {
  const result = askQuestion();

  res.json(result);
};