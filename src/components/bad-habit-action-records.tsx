import { Fragment } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import { useLocalStorage } from "react-use";

import { BadHabitData, WithId } from "~/firebase/firestore";
import {
  BadHabitActionRecordsDuration,
  useBadHabitActionRecords,
} from "~/hooks/use-bad-habit-action-records";

import { BadHabitActionRecordItem } from "./bad-habit-action-record-item";
import { BadHabitActionRecordsGraph } from "./bad-habit-action-records-graph";
import { Fallback } from "./fallback";

export function BadHabitActionRecords({
  badHabit,
}: {
  badHabit: WithId<BadHabitData>;
}) {
  const [open, setOpen] = useLocalStorage(
    `BH.bad-habit.${badHabit.id}.action-records.open`,
    true,
  );

  const [duration, setDuration] =
    useLocalStorage<BadHabitActionRecordsDuration>(
      "BH.bad-habit.records.duration",
      "THREE_DAYS",
    );

  const { badHabitActionRecords, endAtDate, isLoading, error } =
    useBadHabitActionRecords({
      badHabitId: badHabit.id,
      duration: duration as BadHabitActionRecordsDuration,
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <div
          className="font-bold cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          Action records
        </div>

        <button onClick={() => setOpen(!open)}>
          {open ? <FaAngleDown /> : <FaAngleRight />}
        </button>
      </div>

      {open && (
        <Fragment>
          <div className="space-x-2">
            <button
              className="app-link"
              onClick={() => setDuration("THREE_DAYS")}
            >
              3 days
            </button>
            <button
              className="app-link"
              onClick={() => setDuration("FIVE_DAYS")}
            >
              5 days
            </button>
            <button
              className="app-link"
              onClick={() => setDuration("SEVEN_DAYS")}
            >
              7 days
            </button>
          </div>

          <Fallback loading={isLoading} error={error as Error | undefined}>
            {badHabitActionRecords?.length ? (
              <Fragment>
                {/* Graph */}
                <div
                  className="w-full ml-[-16px] mr-4"
                  style={{ height: "75vh" }}
                >
                  <BadHabitActionRecordsGraph
                    endAtDate={endAtDate}
                    badHabitActionRecords={badHabitActionRecords ?? []}
                  />
                </div>

                {/* List */}
                <div>
                  <div>List</div>
                  {badHabitActionRecords?.map((bhar) => (
                    <BadHabitActionRecordItem
                      key={bhar.id}
                      badHabitActionRecord={bhar}
                    />
                  ))}
                </div>
              </Fragment>
            ) : (
              <div className="font-bold text-center">No Data</div>
            )}
          </Fallback>
        </Fragment>
      )}
    </div>
  );
}
