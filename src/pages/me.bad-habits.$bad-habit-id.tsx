import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import invariant from "tiny-invariant";

import { BadHabitAction } from "~/components/bad-habit-action";
import { BadHabitActionRecords } from "~/components/bad-habit-action-records";
import { BadHabitComments } from "~/components/bad-habit-comments";
import { BadHabitDetails } from "~/components/bad-habit-details";
import { Fallback } from "~/components/fallback";
import {
  BadHabitData,
  badHabitsRef,
  mapDoc,
  WithId,
} from "~/firebase/firestore";
import { useAuth } from "~/providers/auth";

export default function BadHabit() {
  const { authUser } = useAuth();
  const { badHabitId } = useParams();
  invariant(badHabitId);

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

  return (
    <Fallback loading={isLoading} error={error as Error}>
      {badHabit && <BadHabitView badHabit={badHabit} />}
    </Fallback>
  );
}

function BadHabitView({ badHabit }: { badHabit: WithId<BadHabitData> }) {
  return (
    <div className="space-y-8">
      <BadHabitDetails badHabit={badHabit} />

      <BadHabitAction badHabit={badHabit} />

      <BadHabitActionRecords badHabit={badHabit} />

      <BadHabitComments badHabit={badHabit} />
    </div>
  );
}
