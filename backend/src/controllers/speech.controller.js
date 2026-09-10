import {
  speechToText,
  textToSpeech
} from "../services/speech.service.js";

export const transcribe = async (req, res) => {
  try {
    const { audio, mimeType } = req.body;

    if (!audio || !mimeType) {
      return res.status(400).json({
        error: "Audio is required"
      });
    }

    const text = await speechToText({
      audio,
      mimeType
    });

    res.json({
      text
    });
  } catch (error) {
  console.error(error);

  if (error?.status === 429) {
    return res.status(429).json({
      error: "Speech transcription quota exceeded"
    });
  }

  res.status(500).json({
    error: "Error transcribing audio"
  });
}
};

export const speak = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "Text is required"
      });
    }

    const audio = await textToSpeech(text);

    res.json({
      audio
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error generating speech"
    });
  }
};