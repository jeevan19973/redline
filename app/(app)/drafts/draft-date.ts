// The date a Draft was added or analyzed, as the library and the Draft page
// show it, in the reader's time zone. The server does not know that zone, so
// it formats in UTC and the browser formats again in its own zone (see
// DraftDate), so a Draft added late in the evening in the Americas shows
// that evening's date.
export function draftDate(createdAt: string, timeZone = "UTC"): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone }).format(new Date(createdAt));
}
