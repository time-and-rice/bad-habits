import { zodResolver } from "@hookform/resolvers/zod";
import { get, useForm } from "react-hook-form";
import { z } from "zod";

import { BadHabitData, WithId } from "~/firebase/firestore";
import { useCreateBadHabitComment } from "~/hooks/use-create-bad-habit-comment";
import { useAuth } from "~/providers/auth";

import { ErrorOrNull } from "./error";
import { getFieldErrorMessages, TextareaAutosizeField } from "./form";

export const BadHabitCommentCreateFormSchema = z.object({
  content: z.string().trim().min(1),
});

export type BadHabitCommentCreateFormSchema = z.infer<
  typeof BadHabitCommentCreateFormSchema
>;

export function BadHabitCommentCreateForm({
  badHabit,
}: {
  badHabit: WithId<BadHabitData>;
}) {
  const { authUser } = useAuth();

  const createBadHabitComment = useCreateBadHabitComment({
    authUserId: authUser.uid,
    badHabitId: badHabit.id,
  });

  const {
    handleSubmit,
    register,
    formState: { errors: fieldErrors },
    reset,
  } = useForm<BadHabitCommentCreateFormSchema>({
    resolver: zodResolver(BadHabitCommentCreateFormSchema),
  });

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={handleSubmit(async (v) => {
        await createBadHabitComment.mutate(v);
        reset();
      })}
    >
      <ErrorOrNull errorMessage={getFieldErrorMessages(fieldErrors)} />
      <ErrorOrNull errorMessage={get(createBadHabitComment, "error.message")} />

      <TextareaAutosizeField
        required
        minRows={2}
        register={register("content")}
      />

      <button type="submit" className="self-end btn btn-sm">
        Submit
      </button>
    </form>
  );
}
