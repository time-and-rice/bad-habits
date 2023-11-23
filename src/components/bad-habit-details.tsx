import { Fragment } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useLocalStorage } from "react-use";

import { BadHabitData, WithId } from "~/firebase/firestore";

export function BadHabitDetails({
  badHabit,
}: {
  badHabit: WithId<BadHabitData>;
}) {
  const [open, setOpen] = useLocalStorage(
    `BH.bad-habit.${badHabit.id}.details.open`,
    true,
  );

  return (
    <div className="space-y-4">
      <div className="font-bold text-center">{badHabit.name}</div>

      <div className="flex items-center space-x-2">
        <div
          className="font-bold cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          Details
        </div>

        <button onClick={() => setOpen(!open)}>
          {open ? <FaAngleDown /> : <FaAngleRight />}
        </button>
      </div>

      {open && (
        <Fragment>
          {badHabit.description && (
            <div className="whitespace-pre-wrap">{badHabit.description}</div>
          )}

          {badHabit.pros && (
            <div>
              <div className="font-semibold">Pros</div>
              <div className="whitespace-pre-wrap">{badHabit.pros}</div>
            </div>
          )}

          {badHabit.cons && (
            <div>
              <div className="font-semibold">Cons</div>
              <div className="whitespace-pre-wrap">{badHabit.cons}</div>
            </div>
          )}

          {badHabit.alternativeActions && (
            <div>
              <div className="font-semibold">Alternative actions</div>
              <div className="whitespace-pre-wrap">
                {badHabit.alternativeActions}
              </div>
            </div>
          )}

          <div className="text-right">
            <Link to="edit" className="app-link">
              Edit
            </Link>
          </div>
        </Fragment>
      )}
    </div>
  );
}
