import { onRequest } from "firebase-functions/v2/https";

import { onRequestConfig } from "@/firebase/initialize";

export const healthCheck = onRequest(onRequestConfig, (_req, res) => {
  res.json({ status: "ok" });
});
