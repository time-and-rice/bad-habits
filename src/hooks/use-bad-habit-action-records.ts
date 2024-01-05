import { useQuery } from "@tanstack/react-query";
import { startOfDay, subDays } from "date-fns";
import { endAt, getDocs, orderBy, query } from "firebase/firestore";
import { useMemo } from "react";

import { badHabitActionRecordsRef, mapDocs } from "~/firebase/firestore";

export type BadHabitActionRecordsDuration =
  | "THREE_DAYS"
  | "FIVE_DAYS"
  | "SEVEN_DAYS";

export function useBadHabitActionRecords({
  authUserId,
  badHabitId,
  duration,
}: {
  authUserId: string;
  badHabitId: string;
  duration: BadHabitActionRecordsDuration;
}) {
  const endAtDate = useMemo(() => {
    const now = new Date();
    switch (duration) {
      case "THREE_DAYS":
        return subDays(startOfDay(now), 2);
      case "FIVE_DAYS":
        return subDays(startOfDay(now), 4);
      case "SEVEN_DAYS":
        return subDays(startOfDay(now), 6);
      default:
        return subDays(startOfDay(now), 2);
    }
  }, [duration]);

  const {
    data: badHabitActionRecords,
    isLoading,
    error,
  } = useQuery({
    queryFn: () => {
      return getDocs(
        query(
          badHabitActionRecordsRef(authUserId, badHabitId),
          orderBy("createdAt", "desc"),
          endAt(endAtDate),
        ),
      ).then(mapDocs);
    },
    queryKey: [
      "me",
      "bad-habits",
      badHabitId,
      "bad-habit-action-records",
      endAtDate,
    ],
  });

  return {
    badHabitActionRecords,
    endAtDate,
    isLoading,
    error,
  };
}
