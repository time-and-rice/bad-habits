import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";

import { badHabitsRef, mapDoc } from "~/firebase/firestore";

export function useBadHabit({
  authUserId,
  badHabitId,
}: {
  authUserId: string;
  badHabitId: string;
}) {
  const {
    data: badHabit,
    isLoading,
    error,
  } = useQuery({
    queryFn: () => {
      return getDoc(doc(badHabitsRef(authUserId), badHabitId)).then(mapDoc);
    },
    queryKey: ["me", "bad-habits", badHabitId],
  });

  return {
    badHabit,
    isLoading,
    error,
  };
}
