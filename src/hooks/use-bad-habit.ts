import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";

import { badHabitsRef, mapDoc } from "~/firebase/firestore";
import { useAuth } from "~/providers/auth";

export function useBadHabit({ badHabitId }: { badHabitId: string }) {
  const { authUser } = useAuth();

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

  return {
    badHabit,
    isLoading,
    error,
  };
}
