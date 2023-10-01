import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { get } from "lodash-es";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { z } from "zod";

import { ErrorOrNull } from "~/components/error";
import { getFieldErrorMessages, InputField } from "~/components/form";
import { auth, functions } from "~/firebase/initialize";
import { useTryState } from "~/hooks/use-try-state";

const signUp = httpsCallable(functions, "signUp");

const SignUpFormSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmation: z.string().min(6),
  })
  .refine(({ password, confirmation }) => password == confirmation, {
    message: "Password does not match.",
    path: ["confirmation"],
  });

type SignUpFormSchema = z.infer<typeof SignUpFormSchema>;

export default function SignUp() {
  const { loading, setLoading, error, setError } = useTryState();

  const {
    handleSubmit,
    register,
    formState: { errors: fieldErrors },
  } = useForm<SignUpFormSchema>({
    resolver: zodResolver(SignUpFormSchema),
  });

  async function onSubmit({ email, password }: SignUpFormSchema) {
    try {
      setLoading(true);
      await signUp({ email, password });
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Signed up.");
    } catch (e) {
      const errMsg =
        get(e, "details.message") || get(e, "message") || "Unexpected error.";
      setError(new Error(errMsg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-center">Sign up</h1>

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
        <InputField
          label="Confirmation"
          type="password"
          autoComplete="on"
          register={register("confirmation")}
        />

        <button type="submit" className="btn w-full" disabled={loading}>
          Submit
        </button>
      </form>

      <Link className="app-link block mt-2" to="/auth/log-in">
        to Log in
      </Link>
    </div>
  );
}
