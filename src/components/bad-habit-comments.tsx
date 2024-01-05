import { Fragment } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import { useLocalStorage } from "react-use";

import { BadHabitData, WithId } from "~/firebase/firestore";
import { useBadHabitComments } from "~/hooks/use-bad-habit-comments";
import { useAuth } from "~/providers/auth";

import { BadHabitCommentCreateForm } from "./bad-habit-comment-create-form";
import { BadHabitCommentItem } from "./bad-habit-comment-item";
import { Fallback } from "./fallback";

export function BadHabitComments({
  badHabit,
}: {
  badHabit: WithId<BadHabitData>;
}) {
  const { authUser } = useAuth();

  const [open, setOpen] = useLocalStorage(
    `BH.bad-habit.${badHabit.id}.comments.open`,
    true,
  );

  const { badHabitComments, isLoading, error, hasNextPage, fetchNextPage } =
    useBadHabitComments({
      authUserId: authUser.uid,
      badHabitId: badHabit.id,
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <div
          className="font-bold cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          Comments
        </div>

        <button onClick={() => setOpen(!open)}>
          {open ? <FaAngleDown /> : <FaAngleRight />}
        </button>
      </div>

      {open && (
        <Fragment>
          <BadHabitCommentCreateForm badHabit={badHabit} />

          <Fallback loading={isLoading} error={error as Error | undefined}>
            {badHabitComments?.length ? (
              <div className="space-y-2">
                {badHabitComments.map((bhc) => (
                  <BadHabitCommentItem key={bhc.id} badHabitComment={bhc} />
                ))}
                {hasNextPage && (
                  <div className="flex justify-center">
                    <button
                      className="app-link"
                      onClick={() => fetchNextPage()}
                    >
                      More
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </Fallback>
        </Fragment>
      )}
    </div>
  );
}
