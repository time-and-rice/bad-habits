import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
} from "firebase/firestore";

import { badHabitCommentsRef, mapDocs } from "~/firebase/firestore";
import { useAuth } from "~/providers/auth";

export function useBadHabitComments({ badHabitId }: { badHabitId: string }) {
  const { authUser } = useAuth();

  const { data, isLoading, error, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["me", "bad-habits", badHabitId, "bad-habit-comments"],
      queryFn: async ({ pageParam = Timestamp.now() }) => {
        return getDocs(
          query(
            badHabitCommentsRef(authUser.uid, badHabitId),
            orderBy("createdAt", "desc"),
            startAfter(pageParam),
            limit(10),
          ),
        ).then(mapDocs);
      },
      getNextPageParam: (lastPage) => {
        return lastPage.at(-1)?.createdAt;
      },
    });

  const badHabitComments = data?.pages.flatMap((v) => v);

  return {
    badHabitComments,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
  };
}
