import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import toast from "react-hot-toast";

import { functions } from "~/firebase/initialize";

export function useDeleteBadHabit() {
  const client = useQueryClient();

  const deleteBadHabit = useMutation({
    mutationFn: async (badHabitId: string) => {
      await httpsCallable(functions, "deleteBadHabit")({ badHabitId });
    },
    onSuccess: () => {
      client.invalidateQueries(["me", "bad-habits"]);
      toast.success("Deleted.");
    },
  });

  return deleteBadHabit;
}
