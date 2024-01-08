import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";

import { badHabitActionRecordsRef } from "~/firebase/firestore";
import { useAuth } from "~/providers/auth";

export function useDeleteBadHabitActionRecord({
  badHabitId,
  badHabitActionRecordId,
}: {
  badHabitId: string;
  badHabitActionRecordId: string;
}) {
  const { authUser } = useAuth();
  const client = useQueryClient();

  const deleteBadHabitActionRecord = useMutation({
    mutationFn: async () => {
      await deleteDoc(
        doc(
          badHabitActionRecordsRef(authUser.uid, badHabitId),
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
