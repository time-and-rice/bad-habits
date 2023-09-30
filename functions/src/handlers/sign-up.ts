import { FirebaseError } from "firebase-admin/app";
import { Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { z } from "zod";

import { usersRef } from "@/firebase/firestore";
import { auth } from "@/firebase/initialize";
import { parseForm } from "@/lib/parse-form";
import { StatusMessage } from "@/lib/status-message";

export const signUp = onCall(async (req) => {
  const form = await parseForm(
    req.data,
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }),
  );
  if (form.isErr())
    throw new HttpsError("failed-precondition", StatusMessage[400], {
      message: form.error,
    });
  const { email, password } = form.value;

  const { uid } = await auth
    .createUser({ email, password })
    .catch((e: FirebaseError) => {
      throw new HttpsError("failed-precondition", StatusMessage[400], {
        message: e.message,
      });
    });
  await usersRef().doc(uid).set({ createdAt: Timestamp.now() });

  return StatusMessage[200];
});
