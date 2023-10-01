import { HttpsError, onCall } from "firebase-functions/v2/https";
import { z } from "zod";

import { badHabitsRef } from "@/firebase/firestore";
import { db } from "@/firebase/initialize";
import { parseForm } from "@/lib/parse-form";
import { StatusMessage } from "@/lib/status-message";

export const deleteBadHabit = onCall(async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", StatusMessage[400]);

  const form = await parseForm(
    req.data,
    z.object({ badHabitId: z.string().min(1) }),
  );
  if (form.isErr())
    throw new HttpsError("failed-precondition", StatusMessage[400], {
      message: form.error,
    });
  const { badHabitId } = form.value;

  await db.recursiveDelete(badHabitsRef(req.auth.uid).doc(badHabitId));

  return StatusMessage[200];
});
