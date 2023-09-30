import { sendPasswordResetEmail, signOut } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import toast from "react-hot-toast";

import { auth, functions } from "~/firebase/initialize";
import { useTryState } from "~/hooks/use-try-state";
import { useAuth } from "~/providers/auth";

const deleteAccount = httpsCallable(functions, "deleteAccount");

export default function Account() {
  const { authUser } = useAuth();

  const { loading, setLoading } = useTryState();

  async function tryDeleteAccount() {
    try {
      setLoading(true);
      await deleteAccount();
    } finally {
      setLoading(false);
    }
  }

  async function onResetPassword() {
    if (
      !window.confirm("Are you sure to send an email to reset your password?")
    )
      return;
    await sendPasswordResetEmail(auth, authUser.email!);
    toast.success("Sended.");
  }

  async function onDeleteAccount() {
    if (!window.confirm("Are you sure to delete your account?")) return;
    await tryDeleteAccount();
    await signOut(auth);
    toast.success("Good bye.");
  }

  return (
    <div>
      <h1 className="text-center">Account</h1>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="font-semibold">ID</div>
          <div>{authUser.uid}</div>
        </div>

        <div className="space-y-2">
          <div className="font-semibold">Email</div>
          <div>{authUser.email}</div>
        </div>

        <div className="space-y-2">
          <div className="font-semibold">Password</div>
          <button className="btn normal-case w-full" onClick={onResetPassword}>
            Reset password
          </button>
        </div>

        <div className="divider" />

        <div className="space-y-2">
          <div className="font-semibold">Caution</div>
          <button
            className="btn btn-error btn-outline normal-case w-full"
            onClick={onDeleteAccount}
            disabled={loading}
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
