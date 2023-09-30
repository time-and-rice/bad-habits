import { HttpsError, onCall } from "firebase-functions/v2/https";

import { usersRef } from "@/firebase/firestore";
import { auth, db } from "@/firebase/initialize";
import { StatusMessage } from "@/lib/status-message";

export const deleteAccount = onCall(async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", StatusMessage[400]);

  await auth.deleteUser(req.auth.uid);
  await db.recursiveDelete(usersRef().doc(req.auth.uid));

  return StatusMessage[200];
});
