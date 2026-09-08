import { askQuestion } from "../services/ask.service.js";

export const ask = async (req, res) => {
  try {
    const { image, mode, question, context } = req.body;

    if (!image || !image.data || !image.mimeType) {
      return res.status(400).json({
        error: "Image is required"
      });
    }

    if (!question) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    const { result, audio } = await askQuestion({
      image,
      mode: mode || "campus",
      question,
      context: context || ""
    });

    res.json({
      result,
      audio
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error processing question"
    });
  }
};