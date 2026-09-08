import { analyzeImage } from "../services/analyze.service.js";

export const analyze = async (req, res) => {
  try {
    const { image, mode } = req.body;

    if (!image || !image.data || !image.mimeType) {
      return res.status(400).json({
        error: "Image is required"
      });
    }

    const result = await analyzeImage({
      image,
      mode: mode || "campus"
    });

    res.json({
      result
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error analyzing image"
    });
  }
};