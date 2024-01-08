import { format } from "date-fns";

import { BadHabitCommentData, WithId } from "~/firebase/firestore";
import { useDeleteBadHabitComment } from "~/hooks/use-delete-bad-habit-comment";

import { DotMenu, MenuItem } from "./app-menu";

const fmtDate = (d: Date) => format(d, "MM/dd HH:mm");

export function BadHabitCommentItem({
  badHabitComment,
}: {
  badHabitComment: WithId<BadHabitCommentData>;
}) {
  const deleteBadHabitComment = useDeleteBadHabitComment({
    badHabitId: badHabitComment.badHabitId,
    badHabitCommentId: badHabitComment.id,
  });

  async function onDelete() {
    if (!window.confirm("Are you sure to delete?")) return;
    await deleteBadHabitComment.mutate();
  }

  return (
    <div>
      <div className="flex justify-between">
        <div>{fmtDate(badHabitComment.createdAt.toDate())}</div>
        <DotMenu>
          <MenuItem onClick={onDelete}>Delete</MenuItem>
        </DotMenu>
      </div>
      <div className="whitespace-pre-wrap leading-snug">
        {badHabitComment.content}
      </div>
    </div>
  );
}
