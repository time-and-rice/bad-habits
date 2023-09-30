import type { ZodError } from "zod";

export function serializeZodError(e: ZodError): string {
  const mapped = e.issues.map((i) => ({
    path: i.path.reduce(
      (acc, cur) => (acc ? acc + "," + cur : cur),
      "",
    ) as string,
    message: i.message,
  }));

  const serialized = mapped.reduce(
    (acc, cur) =>
      acc
        ? `${acc}\n${cur.path}: ${cur.message}`
        : `${cur.path}: ${cur.message}`,
    "",
  );

  return serialized;
}
