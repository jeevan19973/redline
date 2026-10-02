// The date a Draft was added, as the library and the Draft page show it.
// Formatted on the server in UTC, so a Draft added late in the evening in
// the Americas can show the next day's date.
const format = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export function draftDate(createdAt: string): string {
  return format.format(new Date(createdAt));
}
