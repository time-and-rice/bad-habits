import classNames from "classnames";
import { format } from "date-fns";

import { BadHabitActionRecordData, WithId } from "~/firebase/firestore";
import { useDeleteBadHabitActionRecord } from "~/hooks/use-delete-bad-habit-action-record";

import { DotMenu, MenuItem } from "./app-menu";

const fmtDate = (d: Date) => format(d, "MM/dd HH:mm");

export function BadHabitActionRecordItem({
  badHabitActionRecord,
}: {
  badHabitActionRecord: WithId<BadHabitActionRecordData>;
}) {
  const deleteBadHabitActionRecord = useDeleteBadHabitActionRecord({
    badHabitId: badHabitActionRecord.badHabitId,
    badHabitActionRecordId: badHabitActionRecord.id,
  });

  async function onDelete() {
    if (!window.confirm("Are you sure to delete?")) return;
    await deleteBadHabitActionRecord.mutate();
  }

  return (
    <div className="flex justify-between">
      <div className="flex items-center space-x-2">
        <div
          className={classNames("badge badge-sm", {
            "badge-warning": badHabitActionRecord.type == "urge",
            "badge-success": badHabitActionRecord.type == "alternative",
            "badge-error": badHabitActionRecord.type == "bad",
          })}
        />
        <div>{fmtDate(badHabitActionRecord.createdAt.toDate())}</div>
      </div>
      <DotMenu>
        <MenuItem onClick={onDelete}>Delete</MenuItem>
      </DotMenu>
    </div>
  );
}
