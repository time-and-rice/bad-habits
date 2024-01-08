import { zodResolver } from "@hookform/resolvers/zod";
import { get, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { BadHabitData, WithId } from "~/firebase/firestore";
import { useUpdateBadHabit } from "~/hooks/use-update-bad-habit";

import { ErrorOrNull } from "./error";
import {
  getFieldErrorMessages,
  InputField,
  TextareaAutosizeField,
} from "./form";

export const BadHabitsUpdateFormSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim(),
  pros: z.string().trim(),
  cons: z.string().trim(),
  alternativeActions: z.string().trim(),
});

export type BadHabitsUpdateFormSchema = z.infer<
  typeof BadHabitsUpdateFormSchema
>;

export function BadHabitUpdateForm({
  badHabit,
}: {
  badHabit: WithId<BadHabitData>;
}) {
  const updateBadHabit = useUpdateBadHabit({
    badHabitId: badHabit.id,
  });

  const {
    handleSubmit,
    register,
    formState: { errors: fieldErrors },
  } = useForm<BadHabitsUpdateFormSchema>({
    resolver: zodResolver(BadHabitsUpdateFormSchema),
    defaultValues: {
      name: badHabit.name,
      description: badHabit.description,
      pros: badHabit.pros,
      cons: badHabit.cons,
      alternativeActions: badHabit.alternativeActions,
    },
  });

  return (
    <div>
      <h1 className="text-center">Edit Bad Habit</h1>

      <form
        className="space-y-4"
        onSubmit={handleSubmit((v) => updateBadHabit.mutate(v))}
      >
        <ErrorOrNull errorMessage={getFieldErrorMessages(fieldErrors)} />
        <ErrorOrNull errorMessage={get(updateBadHabit, "error.message")} />

        <InputField label="Name" required register={register("name")} />
        <TextareaAutosizeField
          label="Description"
          minRows={2}
          register={register("description")}
        />
        <TextareaAutosizeField
          label="Pros"
          minRows={2}
          register={register("pros")}
        />
        <TextareaAutosizeField
          label="Cons"
          minRows={2}
          register={register("cons")}
        />
        <TextareaAutosizeField
          label="Alternative actions"
          minRows={2}
          register={register("alternativeActions")}
        />

        <button
          type="submit"
          className="btn w-full"
          disabled={updateBadHabit.isLoading}
        >
          Submit
        </button>
      </form>

      <Link
        className="app-link block mt-2"
        to={`/me/bad-habits/${badHabit.id}`}
      >
        back
      </Link>
    </div>
  );
}
