import { useQuery } from "@tanstack/react-query";
import { getDocs, orderBy, query } from "firebase/firestore";

import { badHabitsRef, mapDocs } from "~/firebase/firestore";

export function useBadHabits({ authUserId }: { authUserId: string }) {
  const {
    data: badHabits,
    isLoading,
    error,
  } = useQuery({
    queryFn: () => {
      return getDocs(
        query(badHabitsRef(authUserId), orderBy("updatedAt", "desc")),
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
