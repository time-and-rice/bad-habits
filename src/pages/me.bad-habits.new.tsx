import { zodResolver } from "@hookform/resolvers/zod";
import { get } from "lodash-es";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ErrorOrNull } from "~/components/error";
import {
  getFieldErrorMessages,
  InputField,
  TextareaAutosizeField,
} from "~/components/form";
import { useCreateBadHabit } from "~/hooks/use-create-bad-habit";

export const BadHabitsCreateFormSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim(),
  pros: z.string().trim(),
  cons: z.string().trim(),
  alternativeActions: z.string().trim(),
});

export type BadHabitsCreateFormSchema = z.infer<
  typeof BadHabitsCreateFormSchema
>;

export default function BadHabitsNew() {
  const createBadHabit = useCreateBadHabit();

  const {
    handleSubmit,
    register,
    formState: { errors: fieldErrors },
  } = useForm<BadHabitsCreateFormSchema>({
    resolver: zodResolver(BadHabitsCreateFormSchema),
  });

  return (
    <div>
      <h1 className="text-center">New Bad Habit</h1>

      <form
        className="space-y-4"
        onSubmit={handleSubmit((v) => createBadHabit.mutate(v))}
      >
        <ErrorOrNull errorMessage={getFieldErrorMessages(fieldErrors)} />
        <ErrorOrNull errorMessage={get(createBadHabit, "error.message")} />

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
          disabled={createBadHabit.isLoading}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
