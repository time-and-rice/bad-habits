import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";

import { BadHabitCommentCreateFormSchema } from "~/components/bad-habit-comment-create-form";
import { BadHabitCommentData, badHabitCommentsRef } from "~/firebase/firestore";

export function useCreateBadHabitComment({
  authUserId,
  badHabitId,
}: {
  authUserId: string;
  badHabitId: string;
}) {
  const client = useQueryClient();

  const createBadHabitComment = useMutation({
    mutationFn: async ({ content }: BadHabitCommentCreateFormSchema) => {
      const newBadHabitCommentData: BadHabitCommentData = {
        content,
        createdAt: Timestamp.now(),
        userId: authUserId,
        badHabitId,
      };
      const { id } = await addDoc(
        badHabitCommentsRef(authUserId, badHabitId),
        newBadHabitCommentData,
      );
      return { id, ...newBadHabitCommentData };
    },
    onSuccess: () => {
      toast.success("Created.");
      client.invalidateQueries([
        "me",
        "bad-habits",
        badHabitId,
        "bad-habit-comments",
      ]);
    },
  });

  return createBadHabitComment;
}
