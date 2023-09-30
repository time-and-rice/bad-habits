import { fromThrowable } from "neverthrow";
import { ZodError } from "zod";

import { serializeZodError } from "./serializer";
import { StatusMessage } from "./status-message";

export async function parseForm<T>(
  data: unknown,
  parser: { parse: (data: unknown) => T },
) {
  const getResult = fromThrowable(parser.parse, (e) => {
    if (e instanceof ZodError) return serializeZodError(e);
    return StatusMessage[500];
  });
  return getResult(data);
}
