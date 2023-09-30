import { onCall } from "firebase-functions/v2/https";

export const home = onCall((_req) => {
  return "ok";
});
