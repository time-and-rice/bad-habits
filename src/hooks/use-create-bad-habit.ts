import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { badHabitsRef } from "~/firebase/firestore";
import { BadHabitsCreateFormSchema } from "~/pages/me.bad-habits.new";
import { useAuth } from "~/providers/auth";

export function useCreateBadHabit() {
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
      return addDoc(badHabitsRef(authUser.uid), {
        name,
        description,
        pros,
        cons,
        alternativeActions,
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

  return createBadHabit;
}
