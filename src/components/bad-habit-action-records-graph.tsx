import { eachDayOfInterval, endOfDay, format, startOfDay } from "date-fns";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";

import { BadHabitActionRecordData, WithId } from "~/firebase/firestore";

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

export function BadHabitActionRecordsGraph({
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
