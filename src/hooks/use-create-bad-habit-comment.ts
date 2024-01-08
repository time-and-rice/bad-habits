import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";

import { BadHabitCommentCreateFormSchema } from "~/components/bad-habit-comment-create-form";
import { BadHabitCommentData, badHabitCommentsRef } from "~/firebase/firestore";
import { useAuth } from "~/providers/auth";

export function useCreateBadHabitComment({
  badHabitId,
}: {
  badHabitId: string;
}) {
  const { authUser } = useAuth();
  const client = useQueryClient();

  const createBadHabitComment = useMutation({
    mutationFn: async ({ content }: BadHabitCommentCreateFormSchema) => {
      const newBadHabitCommentData: BadHabitCommentData = {
        content,
        createdAt: Timestamp.now(),
        userId: authUser.uid,
        badHabitId,
      };
      const { id } = await addDoc(
        badHabitCommentsRef(authUser.uid, badHabitId),
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
