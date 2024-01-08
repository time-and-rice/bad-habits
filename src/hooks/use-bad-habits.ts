import { useQuery } from "@tanstack/react-query";
import { getDocs, orderBy, query } from "firebase/firestore";

import { badHabitsRef, mapDocs } from "~/firebase/firestore";
import { useAuth } from "~/providers/auth";

export function useBadHabits() {
  const { authUser } = useAuth();

  const {
    data: badHabits,
    isLoading,
    error,
  } = useQuery({
    queryFn: () => {
      return getDocs(
        query(badHabitsRef(authUser.uid), orderBy("updatedAt", "desc")),
      ).then(mapDocs);
    },
    queryKey: ["me", "bad-habits"],
  });

  return {
    badHabits,
    isLoading,
    error,
  };
}
