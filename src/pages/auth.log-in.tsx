import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { z } from "zod";

import { ErrorOrNull } from "~/components/error";
import { getFieldErrorMessages, InputField } from "~/components/form";
import { auth } from "~/firebase/initialize";
import { useTryState } from "~/hooks/use-try-state";

const LogInFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LogInFormSchema = z.infer<typeof LogInFormSchema>;

export default function LogIn() {
  const { loading, setLoading, error, setError } = useTryState();

  const {
    handleSubmit,
    register,
    formState: { errors: fieldErrors },
  } = useForm<LogInFormSchema>({
    resolver: zodResolver(LogInFormSchema),
  });

  async function onSubmit({ email, password }: LogInFormSchema) {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in.");
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-center">Log In</h1>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <ErrorOrNull errorMessage={error?.message} />
        <ErrorOrNull errorMessage={getFieldErrorMessages(fieldErrors)} />

        <InputField label="Email" type="email" register={register("email")} />
        <InputField
          label="Password"
          type="password"
          autoComplete="on"
          register={register("password")}
        />

        <button type="submit" className="btn w-full" disabled={loading}>
          Submit
        </button>
      </form>

      <Link className="app-link block mt-2" to="/auth/sign-up">
        to Sign up
      </Link>
    </div>
  );
}
