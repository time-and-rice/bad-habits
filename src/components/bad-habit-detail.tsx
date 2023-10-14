import { Link } from "react-router-dom";

import { BadHabitData, WithId } from "~/firebase/firestore";

export function BadHabitDetail({
  badHabit,
}: {
  badHabit: WithId<BadHabitData>;
}) {
  return (
    <div className="space-y-4">
      <div className="font-bold text-center">{badHabit.name}</div>

      {badHabit.description && (
        <div className="whitespace-pre-wrap">{badHabit.description}</div>
      )}

      <div>
        <div className="font-semibold">Pros</div>
        <div className="whitespace-pre-wrap">{badHabit.pros}</div>
      </div>

      <div>
        <div className="font-semibold">Cons</div>
        <div className="whitespace-pre-wrap">{badHabit.cons}</div>
      </div>

      <div>
        <div className="font-semibold">Alternative actions</div>
        <div className="whitespace-pre-wrap">{badHabit.alternativeActions}</div>
      </div>

      <div className="text-right">
        <Link to="edit" className="app-link">
          Edit
        </Link>
      </div>
    </div>
  );
}
