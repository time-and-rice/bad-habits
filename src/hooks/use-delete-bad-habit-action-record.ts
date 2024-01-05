import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";

import { badHabitActionRecordsRef } from "~/firebase/firestore";

export function useDeleteBadHabitActionRecord({
  authUserId,
  badHabitId,
  badHabitActionRecordId,
}: {
  authUserId: string;
  badHabitId: string;
  badHabitActionRecordId: string;
}) {
  const client = useQueryClient();

  const deleteBadHabitActionRecord = useMutation({
    mutationFn: async () => {
      await deleteDoc(
        doc(
          badHabitActionRecordsRef(authUserId, badHabitId),
          badHabitActionRecordId,
        ),
      );
    },
    onSuccess: () => {
      toast.success("Deleted.");
      client.invalidateQueries([
        "me",
        "bad-habits",
        badHabitId,
        "bad-habit-action-records",
      ]);
    },
  });

  return deleteBadHabitActionRecord;
}
