const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Whether a value from a URL or an action call can be a Draft id, checked
// before it reaches a query.
export function isDraftId(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}
