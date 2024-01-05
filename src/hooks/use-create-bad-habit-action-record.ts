import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";

import { BadHabitActionRecordCreateFormSchema } from "~/components/bad-habit-action-record-create-form-modal";
import {
  BadHabitActionRecordData,
  badHabitActionRecordsRef,
} from "~/firebase/firestore";

export function useCreateBadHabitActionRecord({
  authUserId,
  badHabitId,
  actionType,
}: {
  authUserId: string;
  badHabitId: string;
  actionType: BadHabitActionRecordData["type"];
}) {
  const client = useQueryClient();

  const createBadHabitActionRecord = useMutation({
    mutationFn: async ({ createdAt }: BadHabitActionRecordCreateFormSchema) => {
      return await addDoc(badHabitActionRecordsRef(authUserId, badHabitId), {
        type: actionType,
        createdAt: Timestamp.fromDate(new Date(createdAt)),
        userId: authUserId,
        badHabitId,
      });
    },
    onSuccess: () => {
      toast.success("Created.");
      client.invalidateQueries([
        "me",
        "bad-habits",
        badHabitId,
        "bad-habit-action-records",
      ]);
    },
  });

  return createBadHabitActionRecord;
}
