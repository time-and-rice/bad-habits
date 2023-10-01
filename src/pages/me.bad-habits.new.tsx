import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, Timestamp } from "firebase/firestore";
import { get } from "lodash-es";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { ErrorOrNull } from "~/components/error";
import {
  getFieldErrorMessages,
  InputField,
  TextareaAutosizeField,
} from "~/components/form";
import { badHabitsRef } from "~/firebase/firestore";
import { useAuth } from "~/providers/auth";

const BadHabitsCreateFormSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim(),
  pros: z.string().trim().min(1),
  cons: z.string().trim().min(1),
  alternativeActions: z.string().trim().min(1),
});

type BadHabitsCreateFormSchema = z.infer<typeof BadHabitsCreateFormSchema>;

export default function BadHabitsNew() {
  const { authUser } = useAuth();
  const client = useQueryClient();
  const navigate = useNavigate();

  const createBadHabit = useMutation({
    mutationFn: async ({
      name,
      description,
      pros,
      cons,
      alternativeActions,
    }: BadHabitsCreateFormSchema) => {
      const now = Timestamp.now();
      return await addDoc(badHabitsRef(authUser.uid), {
        name,
        description,
        pros,
        cons,
        alternativeActions: alternativeActions.split("\n"),
        createdAt: now,
        updatedAt: now,
        userId: authUser.uid,
      });
    },
    onSuccess: (data) => {
      toast.success("Created.");
      client.invalidateQueries(["me", "bad-habits"]);
      navigate(`/me/bad-habits/${data.id}`);
    },
  });

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
          required
          register={register("pros")}
        />
        <TextareaAutosizeField
          label="Cons"
          minRows={2}
          required
          register={register("cons")}
        />
        <TextareaAutosizeField
          label="Alternative actions"
          minRows={2}
          required
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
