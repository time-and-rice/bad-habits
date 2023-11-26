import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import {
  eachDayOfInterval,
  endOfDay,
  format,
  startOfDay,
  subDays,
} from "date-fns";
import {
  deleteDoc,
  doc,
  endAt,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { Fragment, useMemo } from "react";
import toast from "react-hot-toast";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import { useLocalStorage } from "react-use";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  BadHabitActionRecordData,
  badHabitActionRecordsRef,
  BadHabitData,
  mapDocs,
  WithId,
} from "~/firebase/firestore";
import { useAuth } from "~/providers/auth";

import { DotMenu, MenuItem } from "./app-menu";
import { Fallback } from "./fallback";

const fmtDate = (d: Date) => format(d, "MM/dd HH:mm");

export function BadHabitActionRecords({
  badHabit,
}: {
  badHabit: WithId<BadHabitData>;
}) {
  const { authUser } = useAuth();

  const [open, setOpen] = useLocalStorage(
    `BH.bad-habit.${badHabit.id}.action-records.open`,
    true,
  );

  const [duration, setDuration] = useLocalStorage<
    "THREE_DAYS" | "FIVE_DAYS" | "SEVEN_DAYS"
  >("BH.bad-habit.records.duration", "THREE_DAYS");

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
          badHabitActionRecordsRef(authUser.uid, badHabit.id),
          orderBy("createdAt", "desc"),
          endAt(endAtDate),
        ),
      ).then(mapDocs);
    },
    queryKey: [
      "me",
      "bad-habits",
      badHabit.id,
      "bad-habit-action-records",
      endAtDate,
    ],
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

function fmtXTick(n: number) {
  return format(n, "do");
}

function fmtYTick(n: number) {
  const s = n / 1_000;
  const h = Math.floor(s / (60 * 60));
  const m = Math.floor((s - h * 60 * 60) / 60);
  const hStr = h.toString().padStart(2, "0");
  const mStr = m.toString().padStart(2, "0");
  return `${hStr}:${mStr}`;
}

function BadHabitActionRecordsGraph({
  endAtDate,
  badHabitActionRecords,
}: {
  endAtDate: Date;
  badHabitActionRecords: WithId<BadHabitActionRecordData>[];
}) {
  const dateList = eachDayOfInterval({
    start: endAtDate,
    end: endOfDay(new Date()),
  }).map((v) => v.getTime());

  const data = badHabitActionRecords.map((v) => ({
    ...v,
    date: startOfDay(v.createdAt.toDate()).getTime(),
    time:
      v.createdAt.toDate().getTime() -
      startOfDay(v.createdAt.toDate()).getTime(),
  }));

  const hour = 60 * 60 * 1_000;
  const hours = data.map((v) => Math.floor(v.time / hour) * hour);
  const yTickMin = Math.min(...hours);
  const yTickMax = Math.max(...hours) + hour;
  const yTicks = Array.from({
    length: yTickMax / hour - yTickMin / hour + 1,
  }).map((_, i) => yTickMin + i * hour);

  return (
    <ResponsiveContainer>
      <ScatterChart margin={{ top: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="date"
          domain={[
            dateList[0] - 12 * 60 * 60 * 1_000,
            dateList[dateList.length - 1] + 12 * 60 * 60 * 1_000,
          ]}
          ticks={dateList}
          tickFormatter={fmtXTick}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          type="number"
          dataKey="time"
          domain={[yTickMin, yTickMax]}
          ticks={yTicks}
          tickFormatter={fmtYTick}
          tick={{ fontSize: 12 }}
          reversed
        />
        <Scatter data={data.filter((v) => v.type == "urge")} fill="#fbbd23" />
        <Scatter
          data={data.filter((v) => v.type == "alternative")}
          fill="#36d399"
        />
        <Scatter data={data.filter((v) => v.type == "bad")} fill="#f87272" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function BadHabitActionRecordItem({
  badHabitActionRecord,
}: {
  badHabitActionRecord: WithId<BadHabitActionRecordData>;
}) {
  const { authUser } = useAuth();
  const client = useQueryClient();

  const deleteBadHabitActionRecord = useMutation({
    mutationFn: async () => {
      await deleteDoc(
        doc(
          badHabitActionRecordsRef(
            authUser.uid,
            badHabitActionRecord.badHabitId,
          ),
          badHabitActionRecord.id,
        ),
      );
    },
    onSuccess: () => {
      toast.success("Deleted.");
      client.invalidateQueries([
        "me",
        "bad-habits",
        badHabitActionRecord.badHabitId,
        "bad-habit-action-records",
      ]);
    },
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
