import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";

import { badHabitCommentsRef } from "~/firebase/firestore";
import { useAuth } from "~/providers/auth";

export function useDeleteBadHabitComment({
  badHabitId,
  badHabitCommentId,
}: {
  badHabitId: string;
  badHabitCommentId: string;
}) {
  const { authUser } = useAuth();
  const client = useQueryClient();

  const deleteBadHabitComment = useMutation({
    mutationFn: async () => {
      await deleteDoc(
        doc(badHabitCommentsRef(authUser.uid, badHabitId), badHabitCommentId),
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
