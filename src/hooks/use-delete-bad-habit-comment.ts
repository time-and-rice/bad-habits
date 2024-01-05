import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";

import { badHabitCommentsRef } from "~/firebase/firestore";

export function useDeleteBadHabitComment({
  authUserId,
  badHabitId,
  badHabitCommentId,
}: {
  authUserId: string;
  badHabitId: string;
  badHabitCommentId: string;
}) {
  const client = useQueryClient();

  const deleteBadHabitComment = useMutation({
    mutationFn: async () => {
      await deleteDoc(
        doc(badHabitCommentsRef(authUserId, badHabitId), badHabitCommentId),
      );
      return badHabitCommentId;
    },
    onSuccess: () => {
      toast.success("Deleted.");
      client.invalidateQueries([
        "me",
        "bad-habits",
        badHabitId,
        "bad-habit-comments",
      ]);
    },
  });

  return deleteBadHabitComment;
}
