import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";

import { BadHabitActionRecordCreateFormSchema } from "~/components/bad-habit-action-record-create-form-modal";
import {
  BadHabitActionRecordData,
  badHabitActionRecordsRef,
} from "~/firebase/firestore";
import { useAuth } from "~/providers/auth";

export function useCreateBadHabitActionRecord({
  badHabitId,
  actionType,
}: {
  badHabitId: string;
  actionType: BadHabitActionRecordData["type"];
}) {
  const { authUser } = useAuth();
  const client = useQueryClient();

  const createBadHabitActionRecord = useMutation({
    mutationFn: async ({ createdAt }: BadHabitActionRecordCreateFormSchema) => {
      return await addDoc(badHabitActionRecordsRef(authUser.uid, badHabitId), {
        type: actionType,
        createdAt: Timestamp.fromDate(new Date(createdAt)),
        userId: authUser.uid,
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
