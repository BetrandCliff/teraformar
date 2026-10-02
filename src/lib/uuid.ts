import { randomUUID } from "node:crypto";

/** Generate a random RFC 4122 version 4 UUID. */
export function createUuid(): string {
  return randomUUID();
}
