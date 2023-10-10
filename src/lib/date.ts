export function genDate() {
  return new Date();
}

export function DateFormat(date: Date): string {
  const dateStr = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\//g, "-");

  return dateStr;
}

export function DateTimeFormat(date: Date): string {
  const dateStr = DateFormat(date);
  const timeStr = date.toTimeString().slice(0, 5);

  return `${dateStr}T${timeStr}`;
}
