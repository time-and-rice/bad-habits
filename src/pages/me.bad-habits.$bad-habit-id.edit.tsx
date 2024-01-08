import { useParams } from "react-router-dom";
import invariant from "tiny-invariant";

import { BadHabitUpdateForm } from "~/components/bad-habit-update-form";
import { Fallback } from "~/components/fallback";
import { useBadHabit } from "~/hooks/use-bad-habit";

export default function BadHabitEdit() {
  const { badHabitId } = useParams();
  invariant(badHabitId);

  const { badHabit, isLoading, error } = useBadHabit({
    badHabitId,
  });

  return (
    <Fallback loading={isLoading} error={error as Error}>
      {badHabit && <BadHabitUpdateForm badHabit={badHabit} />}
    </Fallback>
  );
}
