import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, Timestamp } from "firebase/firestore";
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
import { useTryState } from "~/hooks/use-try-state";
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
  const navigate = useNavigate();

  const { loading, setLoading, error, setError } = useTryState();

  const {
    handleSubmit,
    register,
    formState: { errors: fieldErrors },
  } = useForm<BadHabitsCreateFormSchema>({
    resolver: zodResolver(BadHabitsCreateFormSchema),
  });

  async function onSubmit({
    name,
    description,
    pros,
    cons,
    alternativeActions,
  }: BadHabitsCreateFormSchema) {
    try {
      setLoading(true);
      const now = Timestamp.now();
      await addDoc(badHabitsRef(authUser.uid), {
        name,
        description,
        pros,
        cons,
        alternativeActions: alternativeActions.split("\n"),
        createdAt: now,
        updatedAt: now,
        userId: authUser.uid,
      });
      toast.success("Created.");
      navigate("/me/bad-habits");
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-center">New Bad Habit</h1>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <ErrorOrNull errorMessage={getFieldErrorMessages(fieldErrors)} />
        <ErrorOrNull errorMessage={error?.message} />

        <InputField label="Name" required register={register("name")} />
        <TextareaAutosizeField
          label="Description"
          minRows={3}
          required
          register={register("description")}
        />
        <TextareaAutosizeField
          label="Pros"
          minRows={3}
          required
          register={register("pros")}
        />
        <TextareaAutosizeField
          label="Cons"
          minRows={3}
          required
          register={register("cons")}
        />
        <TextareaAutosizeField
          label="Alternative actions"
          minRows={3}
          required
          register={register("alternativeActions")}
        />

        <button type="submit" className="btn w-full" disabled={loading}>
          Submit
        </button>
      </form>
    </div>
  );
}
