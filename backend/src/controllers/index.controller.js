import { getStatusMessage } from "../services/index.service.js";

export const getStatus = (req, res) => {
  const message = getStatusMessage();

  res.json({
    message
  });
};