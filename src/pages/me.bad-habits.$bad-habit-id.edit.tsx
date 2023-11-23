import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { get, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import invariant from "tiny-invariant";
import { z } from "zod";

import { ErrorOrNull } from "~/components/error";
import { Fallback } from "~/components/fallback";
import {
  getFieldErrorMessages,
  InputField,
  TextareaAutosizeField,
} from "~/components/form";
import {
  BadHabitData,
  badHabitsRef,
  mapDoc,
  WithId,
} from "~/firebase/firestore";
import { useAuth } from "~/providers/auth";

export default function BadHabitEdit() {
  const { authUser } = useAuth();
  const { badHabitId } = useParams();
  invariant(badHabitId);

  const {
    data: badHabit,
    isLoading,
    error,
  } = useQuery({
    queryFn: () => {
      return getDoc(doc(badHabitsRef(authUser.uid), badHabitId)).then(mapDoc);
    },
    queryKey: ["me", "bad-habits", badHabitId],
  });

  return (
    <Fallback loading={isLoading} error={error as Error}>
      {badHabit && <BadHabitUpdateForm badHabit={badHabit} />}
    </Fallback>
  );
}

const BadHabitsUpdateFormSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim(),
  pros: z.string().trim(),
  cons: z.string().trim(),
  alternativeActions: z.string().trim(),
});

type BadHabitsUpdateFormSchema = z.infer<typeof BadHabitsUpdateFormSchema>;

function BadHabitUpdateForm({ badHabit }: { badHabit: WithId<BadHabitData> }) {
  const { authUser } = useAuth();
  const client = useQueryClient();
  const navigate = useNavigate();

  const updateBadHabit = useMutation({
    mutationFn: async ({
      name,
      description,
      pros,
      cons,
      alternativeActions,
    }: BadHabitsUpdateFormSchema) => {
      await updateDoc(doc(badHabitsRef(authUser.uid), badHabit.id), {
        name,
        description,
        pros,
        cons,
        alternativeActions,
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: () => {
      toast.success("Updated.");
      client.invalidateQueries(["me", "bad-habits"]);
      navigate(`/me/bad-habits/${badHabit.id}`);
    },
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
