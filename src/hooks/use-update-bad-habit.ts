import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { BadHabitsUpdateFormSchema } from "~/components/bad-habit-update-form";
import { badHabitsRef } from "~/firebase/firestore";

export function useUpdateBadHabit({
  authUserId,
  badHabitId,
}: {
  authUserId: string;
  badHabitId: string;
}) {
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
      await updateDoc(doc(badHabitsRef(authUserId), badHabitId), {
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
