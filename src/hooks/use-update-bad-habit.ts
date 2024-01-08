import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { BadHabitsUpdateFormSchema } from "~/components/bad-habit-update-form";
import { badHabitsRef } from "~/firebase/firestore";
import { useAuth } from "~/providers/auth";

export function useUpdateBadHabit({ badHabitId }: { badHabitId: string }) {
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
      await updateDoc(doc(badHabitsRef(authUser.uid), badHabitId), {
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
      navigate(`/me/bad-habits/${badHabitId}`);
    },
  });

  return updateBadHabit;
}
